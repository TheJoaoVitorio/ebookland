import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { db } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, orderBy } from 'firebase/firestore';
// @ts-ignore
import HTMLFlipBook from 'react-pageflip';
import { X, Settings, Headphones, Pencil, Type, Eraser, LayoutTemplate, Check, ChevronLeft, ChevronRight, Square, Circle, Diamond, ArrowRight, Minus } from 'lucide-react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { DraggableTextBlock, DraggableShapeBlock, renderShapeSvg } from '../components/ReaderBlocks';
import type { TextBlockData, ShapeBlockData, ReaderMode } from '../components/ReaderBlocks';

const TEMPLATES = [
  'Blank', 'Wide Ruled', 'Thin Ruled', 'Dotted Ruled',
  'Dotted', 'Reticle Grid', 'Checks', 'Dashed Checks'
];

const TemplateModal = ({ isOpen, onClose, currentTemplate, onSelect }: any) => {
  const { t } = useTranslation();
  if (!isOpen) return null;
  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div className="template-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>{t('reader_page_template')}</h2>
          <X size={20} className="cursor-pointer" onClick={onClose} />
        </div>
        <div className="template-grid">
          {TEMPLATES.map(templateName => {
            const isSelected = currentTemplate === templateName;
            return (
              <div key={templateName} className={`template-option ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(templateName)}>
                <div className={`template-preview template-${templateName.replace(/ /g, '-')}`}>
                  {isSelected && <div className="check-icon"><Check size={10} strokeWidth={4} /></div>}
                </div>
                <div className="template-name">{t(`template_${templateName.replace(/ /g, '_')}`)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface EnrichedPage {
  id: string;
  pageNumber: number;
  texts: TextBlockData[];
  shapes: ShapeBlockData[];
  drawing: string;
}

const PageOverlay = ({ 
  page, 
  index, 
  pagesLength, 
  mode, 
  isEraser, 
  canvasRefs, 
  handlePageSave,
  template
}: any) => {
  const { t } = useTranslation();
  const [texts, setTexts] = useState<TextBlockData[]>(page.texts || []);
  const [shapes, setShapes] = useState<ShapeBlockData[]>(page.shapes || []);
  const [draftShape, setDraftShape] = useState<ShapeBlockData | null>(null);

  useEffect(() => {
    setTexts(page.texts || []);
    setShapes(page.shapes || []);
  }, [page]);

  const updateBlock = (id: string, partial: Partial<TextBlockData>) => {
    const nextTexts = texts.map(t => t.id === id ? { ...t, ...partial } : t);
    setTexts(nextTexts);
    handlePageSave(nextTexts, shapes, index, page.pageNumber);
  };

  const removeBlock = (id: string) => {
    const nextTexts = texts.filter(t => t.id !== id);
    setTexts(nextTexts);
    handlePageSave(nextTexts, shapes, index, page.pageNumber);
  };

  const updateShape = (id: string, partial: Partial<ShapeBlockData>) => {
    const nextShapes = shapes.map(s => s.id === id ? { ...s, ...partial } : s);
    setShapes(nextShapes);
    handlePageSave(texts, nextShapes, index, page.pageNumber);
  };

  const removeShape = (id: string) => {
    const nextShapes = shapes.filter(s => s.id !== id);
    setShapes(nextShapes);
    handlePageSave(texts, nextShapes, index, page.pageNumber);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (mode === 'write' || mode === 'draw') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDraftShape({
      id: 'draft',
      type: mode as any,
      startX: x,
      startY: y,
      endX: x,
      endY: y
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draftShape || mode === 'write' || mode === 'draw') return;
    const rect = e.currentTarget.getBoundingClientRect();
    setDraftShape(prev => prev ? {
      ...prev,
      endX: e.clientX - rect.left,
      endY: e.clientY - rect.top
    } : null);
  };

  const handlePointerUp = () => {
    if (draftShape) {
      if (Math.abs(draftShape.startX - draftShape.endX) > 2 || Math.abs(draftShape.startY - draftShape.endY) > 2) {
        const newShape: ShapeBlockData = { ...draftShape, id: 'shape-' + Date.now() };
        const nextShapes = [...shapes, newShape];
        setShapes(nextShapes);
        handlePageSave(texts, nextShapes, index, page.pageNumber);
      }
      setDraftShape(null);
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (mode !== 'write') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBlock: TextBlockData = {
      id: 'block-' + Date.now(),
      x,
      y,
      content: '',
      fontFamily: 'Caveat',
      scale: 1
    };
    const nextTexts = [...texts, newBlock];
    setTexts(nextTexts);
    handlePageSave(nextTexts, shapes, index, page.pageNumber);
  };

  return (
    <div 
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', cursor: mode === 'write' ? 'text' : (mode === 'draw' ? 'default' : 'crosshair') }}
      onClick={handleContainerClick}
      onPointerDown={(e) => {
        if (mode === 'write' || mode === 'draw') e.stopPropagation();
        else handlePointerDown(e);
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Background Template */}
      <div className={`template-${template.replace(/ /g, '-')}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: '10px' }} />
      
      {texts.map(block => <DraggableTextBlock key={block.id} block={block} onUpdate={updateBlock} onRemove={removeBlock} mode={mode} />)}
      {shapes.map(shape => <DraggableShapeBlock key={shape.id} block={shape} onUpdate={updateShape} onRemove={removeShape} mode={mode} />)}
      
      {draftShape && renderShapeSvg(draftShape, true)}

      <div 
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: mode === 'draw' ? 50 : 20,
          pointerEvents: mode === 'draw' ? 'auto' : 'none',
          opacity: 1
        }}
      >
        <ReactSketchCanvas
          ref={ref => { if (ref) canvasRefs.current[page.pageNumber] = ref; }}
          strokeWidth={isEraser ? 20 : 4}
          strokeColor={isEraser ? '#FFFFFF' : '#000000'}
          eraserWidth={20}
          canvasColor="transparent"
          backgroundImage={page.drawing || ''}
          onStroke={() => handlePageSave(texts, shapes, index, page.pageNumber)}
        />
      </div>

      <div style={{ position: 'absolute', bottom: '10px', right: '20px', fontSize: '0.8rem', color: '#999', zIndex: 1, pointerEvents: 'none' }}>
        {t('reader_page')} {page.pageNumber}/{pagesLength}
      </div>
    </div>
  );
};

export function Reader() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [pages, setPages] = useState<EnrichedPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ReaderMode>('write');
  const [isEraser, setIsEraser] = useState(false);
  const [template, setTemplate] = useState('Blank');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  const flipBookRef = useRef<any>(null);
  const canvasRefs = useRef<{ [key: number]: any }>({});
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const parseContent = (raw: string) => {
    if (!raw) return { texts: [], shapes: [], drawing: '' };
    try {
      const parsed = JSON.parse(raw);
      if (parsed.texts || parsed.shapes) {
        return { texts: parsed.texts || [], shapes: parsed.shapes || [], drawing: parsed.drawing || '' };
      }
      if (parsed.text !== undefined || parsed.drawing !== undefined) {
        return { 
          texts: parsed.text ? [{ id: 'legacy-' + Date.now(), x: 20, y: 44, content: parsed.text, scale: 1 }] : [], 
          shapes: [],
          drawing: parsed.drawing || '' 
        };
      }
      return { texts: [{ id: 'legacy-raw', x: 20, y: 44, content: raw, scale: 1 }], shapes: [], drawing: '' };
    } catch {
      return { texts: [{ id: 'legacy-catch', x: 20, y: 44, content: raw, scale: 1 }], shapes: [], drawing: '' };
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch pages
        const pagesRef = collection(db, `users/${user.uid}/notebooks/${id}/pages`);
        const q = query(pagesRef, orderBy('pageNumber', 'asc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setPages([{ id: 'temp', pageNumber: 1, texts: [], shapes: [], drawing: '' }]);
        } else {
          setPages(querySnapshot.docs.map(d => ({
            id: d.id,
            pageNumber: d.data().pageNumber,
            ...parseContent(d.data().content)
          })));
        }

        // Fetch notebook details (for template)
        const nbDoc = await getDoc(doc(db, `users/${user.uid}/notebooks/${id}`));
        if (nbDoc.exists() && nbDoc.data().template) {
          setTemplate(nbDoc.data().template);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados do Firestore", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, user, navigate]);

  const updateTemplate = async (newTemplate: string) => {
    if (!user) return;
    setTemplate(newTemplate);
    try {
      await updateDoc(doc(db, `users/${user.uid}/notebooks/${id}`), { template: newTemplate });
    } catch (e) {
      console.error("Failed to update template", e);
    }
  };

  const savePage = async (pageNumber: number, payload: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/notebooks/${id}/pages`, pageNumber.toString()), {
        pageNumber,
        content: payload
      });
    } catch (error) {
      console.error("Failed to save page", error);
    }
  };

  const handlePageSave = async (newTexts: TextBlockData[], newShapes: ShapeBlockData[], index: number, pageNumber: number) => {
    const page = pages[index];
    let drawingData = page.drawing;
    const canvas = canvasRefs.current[pageNumber];
    
    // Always attempt to get the latest drawing data if canvas is active
    if (canvas) {
      try {
        drawingData = await canvas.exportImage('png');
      } catch (e) { }
    }

    const newPages = [...pages];
    newPages[index].texts = newTexts;
    newPages[index].shapes = newShapes;
    newPages[index].drawing = drawingData;
    setPages(newPages);
    
    const payload = JSON.stringify({ texts: newTexts, shapes: newShapes, drawing: drawingData });
    await savePage(pageNumber, payload);
  };

  if (loading) return <div>{t('reader_loading')}</div>;

  return (
    <div style={{ height: '100%', position: 'relative', background: '#FAFAFA', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      
      {/* Top Header */}
      <div style={{ position: 'absolute', top: '10px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Link to="/workspace" style={{ textDecoration: 'none', color: '#888' }}><X size={24} className="cursor-pointer" /></Link>
        <div style={{ display: 'flex', gap: '15px', color: '#888' }}>
          <LayoutTemplate size={20} className="cursor-pointer" onClick={() => setIsTemplateModalOpen(true)} />
          <Settings size={20} className="cursor-pointer" />
          <Headphones size={20} className="cursor-pointer" />
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ 
        position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
        background: '#FFF', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column',
        gap: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 10
      }}>
        <button onClick={() => { setMode('write'); setIsEraser(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: mode === 'write' ? '#000' : '#CCC' }}><Type size={20} /></button>
        <button onClick={() => { setMode('draw'); setIsEraser(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: mode === 'draw' && !isEraser ? '#000' : '#CCC' }}><Pencil size={20} /></button>
        <button onClick={() => { setMode('draw'); setIsEraser(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: mode === 'draw' && isEraser ? '#000' : '#CCC' }}><Eraser size={20} /></button>
        <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #EEE' }} />
        <button onClick={() => { setMode('rectangle'); setIsEraser(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: mode === 'rectangle' ? '#000' : '#CCC' }}><Square size={20} /></button>
        <button onClick={() => { setMode('diamond'); setIsEraser(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: mode === 'diamond' ? '#000' : '#CCC' }}><Diamond size={20} /></button>
        <button onClick={() => { setMode('circle'); setIsEraser(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: mode === 'circle' ? '#000' : '#CCC' }}><Circle size={20} /></button>
        <button onClick={() => { setMode('arrow'); setIsEraser(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: mode === 'arrow' ? '#000' : '#CCC' }}><ArrowRight size={20} /></button>
        <button onClick={() => { setMode('line'); setIsEraser(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: mode === 'line' ? '#000' : '#CCC' }}><Minus size={20} /></button>
      </div>

      {/* Flipbook with Navigation */}
      <div style={{ marginTop: '40px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
        {/* @ts-ignore */}
        <HTMLFlipBook 
          width={500} 
          height={650} 
          size="fixed"
          minWidth={300}
          maxWidth={800}
          minHeight={400}
          maxHeight={1000}
          maxShadowOpacity={0.5}
          showCover={false}
          mobileScrollSupport={true}
          useMouseEvents={false}
          ref={flipBookRef}
          className="notebook-flipbook"
        >
          {pages.map((page, index) => (
            <div key={page.pageNumber} className="page" style={{ 
              background: '#FFF', 
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)', 
              position: 'relative'
            }}>
              <PageOverlay 
                page={page} 
                index={index} 
                pagesLength={pages.length}
                mode={mode}
                isEraser={isEraser}
                canvasRefs={canvasRefs}
                handlePageSave={handlePageSave}
                template={template}
              />
            </div>
          ))}
        </HTMLFlipBook>

        {/* Navigation Footer */}
        <div style={{ width: '100%', maxWidth: '1040px', display: 'flex', justifyContent: 'space-between', padding: '0 10px', marginTop: '0' }}>
          {/* Prev Button */}
          <button 
            onClick={() => flipBookRef.current?.pageFlip().flipPrev()}
            style={{
              background: '#FFF', border: '1px solid #E0E0E0', borderRadius: '50%',
              width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center',
              cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', color: '#555', zIndex: 10
            }}
          >
            <ChevronLeft size={18} />
          </button>

          {/* Next Button */}
          <button 
            onClick={async () => {
              const flip = flipBookRef.current?.pageFlip();
              if (flip) {
                const current = flip.getCurrentPageIndex();
                if (current >= pages.length - 1 || current >= pages.length - 2) {
                  const newPage: EnrichedPage = { id: 'page-' + Date.now(), pageNumber: pages.length + 1, texts: [], shapes: [], drawing: '' };
                  const newPages = [...pages, newPage];
                  setPages(newPages);
                  
                  if (user) {
                    await setDoc(doc(db, `users/${user.uid}/notebooks/${id}/pages`, newPage.pageNumber.toString()), {
                      pageNumber: newPage.pageNumber,
                      content: JSON.stringify({ texts: [], shapes: [], drawing: '' })
                    });
                  }

                  setTimeout(() => flip.flipNext(), 150);
                } else {
                  flip.flipNext();
                }
              }
            }}
            style={{
              background: '#FFF', border: '1px solid #E0E0E0', borderRadius: '50%',
              width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center',
              cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', color: '#555', zIndex: 10
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <TemplateModal 
        isOpen={isTemplateModalOpen} 
        onClose={() => setIsTemplateModalOpen(false)} 
        currentTemplate={template} 
        onSelect={updateTemplate} 
      />
    </div>
  );
}
