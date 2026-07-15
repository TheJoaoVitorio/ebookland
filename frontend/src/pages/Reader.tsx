import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
// @ts-ignore
import HTMLFlipBook from 'react-pageflip';
import { X, Settings, Headphones, Pencil, Type, Eraser, Undo, Redo, Save } from 'lucide-react';
import { ReactSketchCanvas } from 'react-sketch-canvas';

interface NotebookPage {
  id: string;
  pageNumber: number;
  content: string; 
}

interface EnrichedPage {
  id: string;
  pageNumber: number;
  text: string;
  drawing: string;
}

// Page Overlay component to isolate state and prevent Flipbook re-renders on keystrokes
const PageOverlay = ({ 
  page, 
  index, 
  pagesLength, 
  mode, 
  isEraser, 
  canvasRefs, 
  checkOverflow, 
  handleBlur 
}: any) => {
  const [text, setText] = useState(page.text);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    checkOverflow(newText, index, pagesLength);
  };

  return (
    <>
      {/* Ruled lines background */}
      <div style={{ 
        position: 'absolute', inset: 0, 
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #E0E0E0 31px, #E0E0E0 32px)',
        backgroundPosition: '0 40px', pointerEvents: 'none'
      }} />
      
      {/* Text Area (Write Mode) */}
      <textarea 
        value={text}
        onChange={onChange}
        onBlur={() => handleBlur(text, index, page.pageNumber)}
        // Stop propagation so react-pageflip doesn't swallow keyboard focus/clicks
        onClick={(e) => { e.stopPropagation(); e.currentTarget.focus(); }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        style={{ 
          width: '100%', height: '100%', background: 'transparent', border: 'none', resize: 'none',
          padding: '44px 20px 20px 20px', boxSizing: 'border-box',
          fontFamily: 'monospace', fontSize: '1.2rem', lineHeight: '32px', outline: 'none',
          position: 'absolute', top: 0, left: 0,
          zIndex: mode === 'write' ? 50 : 10, 
          pointerEvents: mode === 'write' ? 'auto' : 'none',
          userSelect: 'auto', WebkitUserSelect: 'auto'
        }}
        data-density="soft"
      />

      {/* Canvas Drawing Area (Draw Mode) */}
      <div 
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
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
          onStroke={() => handleBlur(text, index, page.pageNumber)}
        />
      </div>

      <div style={{ position: 'absolute', bottom: '10px', right: '20px', fontSize: '0.8rem', color: '#999', zIndex: 1 }}>
        Página {page.pageNumber}/{pagesLength}
      </div>
    </>
  );
};

export function Reader() {
  const { id } = useParams();
  const [pages, setPages] = useState<EnrichedPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'write' | 'draw'>('write');
  const [isEraser, setIsEraser] = useState(false);
  
  const flipBookRef = useRef<any>(null);
  const canvasRefs = useRef<{ [key: number]: any }>({});

  const parseContent = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.text !== undefined || parsed.drawing !== undefined) {
        return { text: parsed.text || '', drawing: parsed.drawing || '' };
      }
      return { text: raw, drawing: '' };
    } catch {
      return { text: raw, drawing: '' };
    }
  };

  useEffect(() => {
    fetch(`http://localhost:3001/api/notebooks/${id}/pages`)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          setPages([{ id: 'temp', pageNumber: 1, text: '', drawing: '' }]);
        } else {
          setPages(data.map((p: any) => ({
            id: p.id,
            pageNumber: p.pageNumber,
            ...parseContent(p.content)
          })));
        }
        setLoading(false);
      });
  }, [id]);

  const savePage = async (pageNumber: number, text: string, drawing: string) => {
    const payload = JSON.stringify({ text, drawing });
    await fetch(`http://localhost:3001/api/notebooks/${id}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageNumber, content: payload })
    });
  };

  const checkOverflow = (newText: string, index: number, pagesLength: number) => {
    const lines = newText.split('\n').length;
    if (lines > 15 && index === pagesLength - 1) {
      setPages(prev => [...prev, { id: 'temp-' + Date.now(), pageNumber: prev.length + 1, text: '', drawing: '' }]);
      setTimeout(() => {
        if (flipBookRef.current) {
          flipBookRef.current.pageFlip().flipNext();
        }
      }, 300);
    }
  };

  const handleBlur = async (newText: string, index: number, pageNumber: number) => {
    const page = pages[index];
    let drawingData = page.drawing;
    const canvas = canvasRefs.current[pageNumber];
    if (canvas) {
      try {
        drawingData = await canvas.exportImage('png');
      } catch (e) { }
    }

    const newPages = [...pages];
    newPages[index].text = newText;
    newPages[index].drawing = drawingData;
    setPages(newPages);
    
    await savePage(pageNumber, newText, drawingData);
  };

  if (loading) return <div>Carregando caderno...</div>;

  return (
    <div style={{ height: '100%', position: 'relative', background: '#FAFAFA', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      
      {/* Top Header */}
      <div style={{ position: 'absolute', top: '10px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Link to="/workspace" style={{ textDecoration: 'none', color: '#888' }}><X size={24} /></Link>
        <div style={{ display: 'flex', gap: '15px', color: '#888' }}>
          <Settings size={20} style={{ cursor: 'pointer' }} />
          <Headphones size={20} style={{ cursor: 'pointer' }} />
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

      {/* Flipbook */}
      <div style={{ marginTop: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
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
                checkOverflow={checkOverflow}
                handleBlur={handleBlur}
              />
            </div>
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  );
}
