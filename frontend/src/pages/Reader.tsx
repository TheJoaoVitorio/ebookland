import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
// @ts-ignore
import HTMLFlipBook from 'react-pageflip';
import { X, Settings, Headphones, Pencil, Highlighter, Eraser, Undo, Redo } from 'lucide-react';

interface NotebookPage {
  id: string;
  pageNumber: number;
  content: string;
}

export function Reader() {
  const { id } = useParams();
  const [pages, setPages] = useState<NotebookPage[]>([]);
  const [loading, setLoading] = useState(true);
  const flipBookRef = useRef<any>(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/notebooks/${id}/pages`)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          setPages([{ id: 'temp', pageNumber: 1, content: '' }]);
        } else {
          setPages(data);
        }
        setLoading(false);
      });
  }, [id]);

  const savePage = async (pageNumber: number, content: string) => {
    await fetch(`http://localhost:3001/api/notebooks/${id}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageNumber, content })
    });
  };

  const handleContentChange = (index: number, newContent: string) => {
    const newPages = [...pages];
    newPages[index].content = newContent;
    setPages(newPages);
  };

  const checkOverflow = (e: React.ChangeEvent<HTMLTextAreaElement>, index: number) => {
    handleContentChange(index, e.target.value);
    
    // Simulate pagination limit
    const lines = e.target.value.split('\n').length;
    if (lines > 15 && index === pages.length - 1) {
      // Create new page and turn
      setPages([...pages, { id: 'temp-' + Date.now(), pageNumber: pages.length + 1, content: '' }]);
      setTimeout(() => {
        if (flipBookRef.current) {
          flipBookRef.current.pageFlip().flipNext();
        }
      }, 300);
    }
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
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}><Pencil size={20} /></button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}><Highlighter size={20} /></button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}><Eraser size={20} /></button>
        <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #EEE' }} />
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}><Undo size={20} /></button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}><Redo size={20} /></button>
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
              {/* Ruled lines background */}
              <div style={{ 
                position: 'absolute', inset: 0, 
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #E0E0E0 31px, #E0E0E0 32px)',
                backgroundPosition: '0 40px', pointerEvents: 'none'
              }} />
              
              <textarea 
                value={page.content}
                onChange={(e) => checkOverflow(e, index)}
                onBlur={() => savePage(page.pageNumber, page.content)}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ 
                  width: '100%', height: '100%', background: 'transparent', border: 'none', resize: 'none',
                  padding: '44px 20px 20px 20px', boxSizing: 'border-box',
                  fontFamily: 'monospace', fontSize: '1.2rem', lineHeight: '32px', outline: 'none',
                  position: 'relative', zIndex: 50, pointerEvents: 'auto'
                }}
              />
              <div style={{ position: 'absolute', bottom: '10px', right: '20px', fontSize: '0.8rem', color: '#999' }}>
                Página {page.pageNumber}/{pages.length}
              </div>
            </div>
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  );
}
