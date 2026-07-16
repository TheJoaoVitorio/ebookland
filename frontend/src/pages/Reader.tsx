import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
// @ts-ignore
import HTMLFlipBook from 'react-pageflip';
import { X, Settings, Headphones, Pencil, Type, Eraser, Undo, Redo, LayoutTemplate, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactSketchCanvas } from 'react-sketch-canvas';

const TEMPLATES = [
  'Blank', 'Wide Ruled', 'Thin Ruled', 'Dotted Ruled',
  'Dotted', 'Reticle Grid', 'Checks', 'Dashed Checks'
];

const TemplateModal = ({ isOpen, onClose, currentTemplate, onSelect }: any) => {
  if (!isOpen) return null;
  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div className="template-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Page Template</h2>
          <X size={20} className="cursor-pointer" onClick={onClose} />
        </div>
        <div className="template-grid">
          {TEMPLATES.map(t => {
            const isSelected = currentTemplate === t;
            return (
              <div key={t} className={`template-option ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(t)}>
                <div className={`template-preview template-${t.replace(/ /g, '-')}`}>
                  {isSelected && <div className="check-icon"><Check size={10} strokeWidth={4} /></div>}
                </div>
                <div className="template-name">{t}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface TextBlockData {
  id: string;
  x: number;
  y: number;
  content: string;
  fontFamily?: string;
}

interface EnrichedPage {
  id: string;
  pageNumber: number;
  texts: TextBlockData[];
  drawing: string;
}

const DraggableTextBlock = ({ block, onUpdate, onRemove, onTriggerSave, mode }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: block.x, y: block.y });
  const positionRef = useRef(position);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isDragging = useRef(false);
  const dragStart = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    setPosition({ x: block.x, y: block.y });
  }, [block.x, block.y]);

  useEffect(() => {
    if (block.content === '') {
      setIsFocused(true);
      setTimeout(() => {
        contentRef.current?.focus();
      }, 50);
    }
  }, [block.content]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      e.preventDefault(); 
      const dx = e.clientX - dragStart.current.startX;
      const dy = e.clientY - dragStart.current.startY;
      setPosition({
        x: dragStart.current.initialX + dx,
        y: dragStart.current.initialY + dy
      });
    };

    const handlePointerUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      onUpdate(block.id, { x: positionRef.current.x, y: positionRef.current.y });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (mode !== 'write') return;
    e.stopPropagation();
    isDragging.current = true;
    dragStart.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  const handleBlur = () => {
    setIsFocused(false);
    const text = contentRef.current?.innerText || '';
    if (text.trim() === '') {
      onRemove(block.id);
    } else {
      onUpdate(block.id, { content: text });
    }
  };

  useEffect(() => {
    if (isFocused && contentRef.current) {
      setTimeout(() => {
        contentRef.current?.focus();
      }, 50);
    }
  }, [isFocused]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'write') {
      setIsFocused(true);
    }
  };

  return (
      <div 
        style={{ 
          position: 'absolute', 
          zIndex: 60,
          transform: `translate(${position.x}px, ${position.y}px)`,
          padding: '4px 8px',
          border: isFocused ? '1px dashed #00bfff' : (isSelected ? '1px solid #00bfff' : '1px solid transparent'),
          borderRadius: '4px',
          background: isFocused ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
          pointerEvents: mode === 'write' ? 'auto' : 'none',
        }} 
      >
        {/* FONT SELECTOR TOOLBAR */}
        {(isSelected || isFocused) && mode === 'write' && (
          <div 
            style={{
              position: 'absolute',
              top: '-45px',
              left: 0,
              background: 'white',
              padding: '4px',
              borderRadius: '6px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              zIndex: 100,
              display: 'flex',
              gap: '4px'
            }} 
            onPointerDown={(e) => {
              e.preventDefault(); 
              e.stopPropagation();
            }}
          >
            {['Caveat', 'Kalam', 'Patrick Hand', 'Shadows Into Light', 'Outfit'].map(f => (
              <button 
                key={f}
                style={{
                  fontFamily: f,
                  padding: '4px 8px',
                  border: (block.fontFamily || 'Caveat') === f ? '1px solid #00bfff' : '1px solid #eee',
                  background: (block.fontFamily || 'Caveat') === f ? '#e6f7ff' : 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  lineHeight: '1',
                  color: '#333'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(block.id, { fontFamily: f });
                }}
              >
                Abc
              </button>
            ))}
          </div>
        )}

        <div
          ref={contentRef}
          contentEditable={true}
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={(e) => e.stopPropagation()}
          style={{
            fontFamily: block.fontFamily ? `"${block.fontFamily}", cursive` : '"Caveat", cursive',
            fontSize: '1.4rem',
            lineHeight: '1.4',
            outline: 'none',
            minWidth: '20px',
            minHeight: '28px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            color: '#333',
            userSelect: 'text',
            WebkitUserSelect: 'text',
            cursor: 'text'
          }}
        >
          {block.content}
        </div>

        {/* DRAG AND CLICK SHIELD */}
        {!isFocused && (
          <div 
            tabIndex={0}
            onFocus={() => setIsSelected(true)}
            onBlur={() => setIsSelected(false)}
            onPointerDown={(e) => {
              e.currentTarget.focus();
              handlePointerDown(e);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Delete' || e.key === 'Backspace') {
                e.stopPropagation();
                onRemove(block.id);
              }
            }}
            onDoubleClick={handleDoubleClick}
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.focus();
            }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              cursor: mode === 'write' ? 'grab' : 'default',
              zIndex: 10,
              outline: 'none'
            }}
          />
        )}
      </div>
  );
};

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
  const [texts, setTexts] = useState<TextBlockData[]>(page.texts || []);

  const handleContainerClick = (e: React.MouseEvent) => {
    if (mode !== 'write') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBlock = {
      id: 'block-' + Date.now(),
      x,
      y,
      content: '',
      fontFamily: 'Caveat'
    };
    setTexts(prev => [...prev, newBlock]);
  };

  const updateBlock = (id: string, partial: Partial<TextBlockData>) => {
    const nextTexts = texts.map(t => t.id === id ? { ...t, ...partial } : t);
    setTexts(nextTexts);
    handlePageSave(nextTexts, index, page.pageNumber);
  };

  const removeBlock = (id: string) => {
    const nextTexts = texts.filter(t => t.id !== id);
    setTexts(nextTexts);
    handlePageSave(nextTexts, index, page.pageNumber);
  };

  return (
    <div 
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', cursor: mode === 'write' ? 'text' : 'default' }}
      onClick={handleContainerClick}
      onPointerDown={(e) => {
        // Only stop propagation if we are clicking directly on the page background in write mode
        if (mode === 'write') e.stopPropagation();
      }}
    >
      {/* Background Template */}
      <div className={`template-${template.replace(/ /g, '-')}`} style={{ 
        position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: '10px'
      }} />
      
      {/* Text Blocks (Canvas Mode) */}
      {texts.map(block => (
        <DraggableTextBlock 
          key={block.id} 
          block={block} 
          onUpdate={updateBlock} 
          onRemove={removeBlock}
          mode={mode} 
        />
      ))}

      {/* Canvas Drawing Area (Draw Mode) */}
      <div 
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: mode === 'draw' ? 50 : 20,
          pointerEvents: mode === 'draw' ? 'auto' : 'none',
          opacity: 1 // Keep drawings always visible
        }}
      >
        <ReactSketchCanvas
          ref={ref => { if (ref) canvasRefs.current[page.pageNumber] = ref; }}
          strokeWidth={isEraser ? 20 : 4}
          strokeColor={isEraser ? '#FFFFFF' : '#000000'}
          eraserWidth={20}
          canvasColor="transparent"
          backgroundImage={page.drawing || ''}
          onStroke={() => handlePageSave(texts, index, page.pageNumber)}
        />
      </div>

      <div style={{ position: 'absolute', bottom: '10px', right: '20px', fontSize: '0.8rem', color: '#999', zIndex: 1, pointerEvents: 'none' }}>
        Página {page.pageNumber}/{pagesLength}
      </div>
    </div>
  );
};

export function Reader() {
  const { id } = useParams();
  const [pages, setPages] = useState<EnrichedPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'write' | 'draw'>('write');
  const [isEraser, setIsEraser] = useState(false);
  const [template, setTemplate] = useState('Blank');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  const flipBookRef = useRef<any>(null);
  const canvasRefs = useRef<{ [key: number]: any }>({});

  const parseContent = (raw: string) => {
    if (!raw) return { texts: [], drawing: '' };
    try {
      const parsed = JSON.parse(raw);
      if (parsed.texts) {
        return { texts: parsed.texts, drawing: parsed.drawing || '' };
      }
      if (parsed.text !== undefined || parsed.drawing !== undefined) {
        return { 
          texts: parsed.text ? [{ id: 'legacy-' + Date.now(), x: 20, y: 44, content: parsed.text }] : [], 
          drawing: parsed.drawing || '' 
        };
      }
      return { texts: [{ id: 'legacy-raw', x: 20, y: 44, content: raw }], drawing: '' };
    } catch {
      return { texts: [{ id: 'legacy-catch', x: 20, y: 44, content: raw }], drawing: '' };
    }
  };

  useEffect(() => {
    fetch(`http://localhost:3001/api/notebooks/${id}/pages`)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          setPages([{ id: 'temp', pageNumber: 1, texts: [], drawing: '' }]);
        } else {
          setPages(data.map((p: any) => ({
            id: p.id,
            pageNumber: p.pageNumber,
            ...parseContent(p.content)
          })));
        }
        setLoading(false);
      });

    fetch(`http://localhost:3001/api/notebooks/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.template) {
          setTemplate(data.template);
        }
      })
      .catch(e => console.error("Could not fetch notebook details", e));
  }, [id]);

  const updateTemplate = async (newTemplate: string) => {
    setTemplate(newTemplate);
    try {
      await fetch(`http://localhost:3001/api/notebooks/${id}/template`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: newTemplate })
      });
    } catch (e) {
      console.error("Failed to update template", e);
    }
  };

  const savePage = async (pageNumber: number, payload: string) => {
    await fetch(`http://localhost:3001/api/notebooks/${id}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageNumber, content: payload })
    });
  };

  const handlePageSave = async (newTexts: TextBlockData[], index: number, pageNumber: number) => {
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
    newPages[index].drawing = drawingData;
    setPages(newPages);
    
    const payload = JSON.stringify({ texts: newTexts, drawing: drawingData });
    await savePage(pageNumber, payload);
  };

  if (loading) return <div>Carregando caderno...</div>;

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
        <button 
          onClick={() => { setMode('write'); setIsEraser(false); }} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: mode === 'write' ? '#000' : '#CCC' }}
        >
          <Type size={20} />
        </button>
        <button 
          onClick={() => { setMode('draw'); setIsEraser(false); }} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: mode === 'draw' && !isEraser ? '#000' : '#CCC' }}
        >
          <Pencil size={20} />
        </button>
        <button 
          onClick={() => { setMode('draw'); setIsEraser(true); }} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: mode === 'draw' && isEraser ? '#000' : '#CCC' }}
        >
          <Eraser size={20} />
        </button>
        <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #EEE' }} />
        <button onClick={() => {
          Object.values(canvasRefs.current).forEach(c => c && c.undo && c.undo());
        }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}><Undo size={20} /></button>
        <button onClick={() => {
          Object.values(canvasRefs.current).forEach(c => c && c.redo && c.redo());
        }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}><Redo size={20} /></button>
      </div>

      {/* Flipbook with Navigation */}
      <div style={{ marginTop: '40px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
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
                  const newPage = { id: 'page-' + Date.now(), pageNumber: pages.length + 1, texts: [], drawing: '' };
                  const newPages = [...pages, newPage];
                  setPages(newPages);
                  
                  await fetch(`http://localhost:3001/api/notebooks/${id}/pages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pageNumber: newPage.pageNumber, content: JSON.stringify({ texts: [], drawing: '' }) })
                  });

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
