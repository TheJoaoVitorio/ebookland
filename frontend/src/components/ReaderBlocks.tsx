import React, { useState, useEffect, useRef } from 'react';

export interface TextBlockData {
  id: string;
  x: number;
  y: number;
  content: string;
  fontFamily?: string;
  scale?: number;
}

export interface ShapeBlockData {
  id: string;
  type: 'rectangle' | 'circle' | 'diamond' | 'arrow' | 'line';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export type ReaderMode = 'select' | 'write' | 'draw' | 'rectangle' | 'circle' | 'diamond' | 'arrow' | 'line';

// Helper to calculate bounding box and SVG path for shapes
export const renderShapeSvg = (shape: ShapeBlockData, isDraft = false) => {
  const x = Math.min(shape.startX, shape.endX);
  const y = Math.min(shape.startY, shape.endY);
  const width = Math.abs(shape.startX - shape.endX);
  const height = Math.abs(shape.startY - shape.endY);
  
  // For lines and arrows, we draw exactly from start to end.
  // We need to map global startX/Y to the local SVG coordinate space.
  const localStartX = shape.startX - x;
  const localStartY = shape.startY - y;
  const localEndX = shape.endX - x;
  const localEndY = shape.endY - y;

  const strokeColor = '#333';
  const strokeWidth = 2;

  let content = null;
  if (shape.type === 'rectangle') {
    content = <rect x="0" y="0" width={Math.max(1, width)} height={Math.max(1, height)} fill="transparent" stroke={strokeColor} strokeWidth={strokeWidth} rx="4" />;
  } else if (shape.type === 'circle') {
    content = <ellipse cx={width / 2} cy={height / 2} rx={Math.max(0.5, width / 2)} ry={Math.max(0.5, height / 2)} fill="transparent" stroke={strokeColor} strokeWidth={strokeWidth} />;
  } else if (shape.type === 'diamond') {
    content = <polygon points={`${width/2},0 ${width},${height/2} ${width/2},${height} 0,${height/2}`} fill="transparent" stroke={strokeColor} strokeWidth={strokeWidth} />;
  } else if (shape.type === 'line') {
    content = <line x1={localStartX} y1={localStartY} x2={localEndX} y2={localEndY} stroke={strokeColor} strokeWidth={strokeWidth} />;
  } else if (shape.type === 'arrow') {
    const angle = Math.atan2(localEndY - localStartY, localEndX - localStartX);
    const headLength = 10;
    const dx1 = localEndX - headLength * Math.cos(angle - Math.PI / 6);
    const dy1 = localEndY - headLength * Math.sin(angle - Math.PI / 6);
    const dx2 = localEndX - headLength * Math.cos(angle + Math.PI / 6);
    const dy2 = localEndY - headLength * Math.sin(angle + Math.PI / 6);
    content = (
      <>
        <line x1={localStartX} y1={localStartY} x2={localEndX} y2={localEndY} stroke={strokeColor} strokeWidth={strokeWidth} />
        <path d={`M ${localEndX} ${localEndY} L ${dx1} ${dy1} M ${localEndX} ${localEndY} L ${dx2} ${dy2}`} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
      </>
    );
  }

  // Add some padding to SVG so strokes don't clip. For lines/arrows, bounding box might be 0.
  const svgPadding = 4;
  
  return (
    <div style={{
      position: 'absolute',
      left: x - svgPadding,
      top: y - svgPadding,
      width: width + svgPadding * 2,
      height: height + svgPadding * 2,
      pointerEvents: isDraft ? 'none' : 'auto'
    }}>
      <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
        <g transform={`translate(${svgPadding}, ${svgPadding})`}>
          {content}
        </g>
      </svg>
    </div>
  );
};

export const DraggableShapeBlock = ({ block, onUpdate, onRemove, mode }: { block: ShapeBlockData, onUpdate: any, onRemove: any, mode: ReaderMode }) => {
  const [isSelected, setIsSelected] = useState(false);
  const [coords, setCoords] = useState({ startX: block.startX, startY: block.startY, endX: block.endX, endY: block.endY });
  
  const isDragging = useRef(false);
  const isResizing = useRef<string | null>(null); // 'start', 'end', 'tl', 'tr', 'bl', 'br'
  const dragStart = useRef({ startX: 0, startY: 0, initialCoords: coords });

  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  useEffect(() => { setCoords({ startX: block.startX, startY: block.startY, endX: block.endX, endY: block.endY }); }, [block]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging.current) {
        const dx = e.clientX - dragStart.current.startX;
        const dy = e.clientY - dragStart.current.startY;
        setCoords({
          startX: dragStart.current.initialCoords.startX + dx,
          startY: dragStart.current.initialCoords.startY + dy,
          endX: dragStart.current.initialCoords.endX + dx,
          endY: dragStart.current.initialCoords.endY + dy,
        });
      } else if (isResizing.current) {
        const dx = e.clientX - dragStart.current.startX;
        const dy = e.clientY - dragStart.current.startY;
        let newCoords = { ...dragStart.current.initialCoords };
        
        // For lines/arrows
        if (isResizing.current === 'start') {
          newCoords.startX += dx;
          newCoords.startY += dy;
        } else if (isResizing.current === 'end') {
          newCoords.endX += dx;
          newCoords.endY += dy;
        }
        // For rect/circle/diamond (bounding box)
        else {
          const { initialCoords } = dragStart.current;
          const minX = Math.min(initialCoords.startX, initialCoords.endX);
          const maxX = Math.max(initialCoords.startX, initialCoords.endX);
          const minY = Math.min(initialCoords.startY, initialCoords.endY);
          const maxY = Math.max(initialCoords.startY, initialCoords.endY);
          
          let nMinX = minX, nMaxX = maxX, nMinY = minY, nMaxY = maxY;
          
          if (isResizing.current.includes('l')) nMinX += dx;
          if (isResizing.current.includes('r')) nMaxX += dx;
          if (isResizing.current.includes('t')) nMinY += dy;
          if (isResizing.current.includes('b')) nMaxY += dy;

          newCoords.startX = nMinX;
          newCoords.endX = nMaxX;
          newCoords.startY = nMinY;
          newCoords.endY = nMaxY;
        }
        setCoords(newCoords);
      }
    };

    const handlePointerUp = () => {
      if (isDragging.current || isResizing.current) {
        isDragging.current = false;
        isResizing.current = null;
        setCoords(current => {
          onUpdateRef.current(block.id, current);
          return current;
        });
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [block.id]);

  const x = Math.min(coords.startX, coords.endX);
  const y = Math.min(coords.startY, coords.endY);
  const width = Math.abs(coords.startX - coords.endX);
  const height = Math.abs(coords.startY - coords.endY);

  const startDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDragging.current = true;
    dragStart.current = { startX: e.clientX, startY: e.clientY, initialCoords: coords };
    setIsSelected(true);
  };

  const startResize = (e: React.PointerEvent, handle: string) => {
    e.stopPropagation();
    isResizing.current = handle;
    dragStart.current = { startX: e.clientX, startY: e.clientY, initialCoords: coords };
  };

  const isLine = block.type === 'line' || block.type === 'arrow';

  return (
    <>
      <div 
        tabIndex={0}
        onFocus={() => setIsSelected(true)}
        onBlur={() => setIsSelected(false)}
        onPointerDown={(e) => (mode === 'write' || mode === 'select') ? startDrag(e) : null}
        onKeyDown={(e) => {
          if (e.key === 'Delete' || e.key === 'Backspace') {
            e.stopPropagation();
            onRemove(block.id);
          }
        }}
        style={{
          position: 'absolute',
          left: x, top: y, width, height,
          zIndex: 60,
          outline: isSelected ? '1px solid #00bfff' : 'none',
          cursor: (mode === 'write' || mode === 'select') ? 'grab' : 'default',
        }}
      >
        {/* Render Handles */}
        {isSelected && (mode === 'write' || mode === 'select') && (
          isLine ? (
            <>
              <div onPointerDown={e => startResize(e, 'start')} style={{ position: 'absolute', left: coords.startX - x - 5, top: coords.startY - y - 5, width: 10, height: 10, background: '#00bfff', borderRadius: '50%', cursor: 'pointer' }} />
              <div onPointerDown={e => startResize(e, 'end')} style={{ position: 'absolute', left: coords.endX - x - 5, top: coords.endY - y - 5, width: 10, height: 10, background: '#00bfff', borderRadius: '50%', cursor: 'pointer' }} />
            </>
          ) : (
            <>
              <div onPointerDown={e => startResize(e, 'tl')} style={{ position: 'absolute', left: -5, top: -5, width: 10, height: 10, background: '#00bfff', cursor: 'nwse-resize' }} />
              <div onPointerDown={e => startResize(e, 'tr')} style={{ position: 'absolute', right: -5, top: -5, width: 10, height: 10, background: '#00bfff', cursor: 'nesw-resize' }} />
              <div onPointerDown={e => startResize(e, 'bl')} style={{ position: 'absolute', left: -5, bottom: -5, width: 10, height: 10, background: '#00bfff', cursor: 'nesw-resize' }} />
              <div onPointerDown={e => startResize(e, 'br')} style={{ position: 'absolute', right: -5, bottom: -5, width: 10, height: 10, background: '#00bfff', cursor: 'nwse-resize' }} />
            </>
          )
        )}
      </div>
      {renderShapeSvg({ ...block, ...coords }, false)}
    </>
  );
};

export const DraggableTextBlock = ({ block, onUpdate, onRemove, mode }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: block.x, y: block.y });
  const [scale, setScale] = useState(block.scale || 1);
  const positionRef = useRef(position);
  const scaleRef = useRef(scale);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStart = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0, initialScale: 1 });

  const [isSelected, setIsSelected] = useState(false);

  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  useEffect(() => { positionRef.current = position; scaleRef.current = scale; }, [position, scale]);
  useEffect(() => { setPosition({ x: block.x, y: block.y }); setScale(block.scale || 1); }, [block.x, block.y, block.scale]);

  useEffect(() => {
    if (block.content === '') {
      setIsFocused(true);
      setTimeout(() => contentRef.current?.focus(), 50);
    }
  }, [block.content]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging.current) {
        e.preventDefault(); 
        const dx = e.clientX - dragStart.current.startX;
        const dy = e.clientY - dragStart.current.startY;
        setPosition({
          x: dragStart.current.initialX + dx,
          y: dragStart.current.initialY + dy
        });
      } else if (isResizing.current) {
        e.preventDefault();
        const dx = e.clientX - dragStart.current.startX;
        // Simple scaling based on horizontal drag distance relative to roughly 100px width.
        const newScale = Math.max(0.5, dragStart.current.initialScale + (dx / 100));
        setScale(newScale);
      }
    };

    const handlePointerUp = () => {
      if (isDragging.current || isResizing.current) {
        isDragging.current = false;
        isResizing.current = false;
        onUpdateRef.current(block.id, { x: positionRef.current.x, y: positionRef.current.y, scale: scaleRef.current });
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [block.id]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (mode !== 'write' && mode !== 'select') return;
    e.stopPropagation();
    isDragging.current = true;
    dragStart.current = { startX: e.clientX, startY: e.clientY, initialX: position.x, initialY: position.y, initialScale: scale };
  };

  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    isResizing.current = true;
    dragStart.current = { startX: e.clientX, startY: e.clientY, initialX: position.x, initialY: position.y, initialScale: scale };
  };

  const handleBlur = () => {
    setIsFocused(false);
    const text = contentRef.current?.innerText || '';
    if (text.trim() === '') onRemove(block.id);
    else onUpdateRef.current(block.id, { content: text });
  };

  return (
      <div 
        style={{ 
          position: 'absolute', 
          zIndex: 60,
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'top left',
          padding: '4px 8px',
          border: isFocused ? '1px dashed #00bfff' : (isSelected ? '1px solid #00bfff' : '1px solid transparent'),
          borderRadius: '4px',
          background: isFocused ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
          pointerEvents: (mode === 'write' || mode === 'select') ? 'auto' : 'none',
        }} 
      >
        {(isSelected || isFocused) && (mode === 'write' || mode === 'select') && (
          <div 
            style={{ position: 'absolute', top: '-45px', left: 0, background: 'white', padding: '4px', borderRadius: '6px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', zIndex: 100, display: 'flex', gap: '4px', transform: `scale(${1/scale})`, transformOrigin: 'top left' }} 
            onPointerDown={e => e.stopPropagation()}
          >
            {['Caveat', 'Kalam', 'Patrick Hand', 'Shadows Into Light', 'Outfit'].map(f => (
              <button 
                key={f}
                style={{ fontFamily: f, padding: '4px 8px', border: (block.fontFamily || 'Caveat') === f ? '1px solid #00bfff' : '1px solid #eee', background: (block.fontFamily || 'Caveat') === f ? '#e6f7ff' : 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', lineHeight: '1', color: '#333' }}
                onClick={(e) => { e.stopPropagation(); onUpdateRef.current(block.id, { fontFamily: f }); }}
              >Abc</button>
            ))}
          </div>
        )}

        <div
          ref={contentRef}
          contentEditable={true}
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={(e) => e.stopPropagation()}
          style={{ fontFamily: block.fontFamily ? `"${block.fontFamily}", cursive` : '"Caveat", cursive', fontSize: '1.4rem', lineHeight: '1.4', outline: 'none', minWidth: '20px', minHeight: '28px', whiteSpace: 'pre-wrap', wordWrap: 'break-word', color: '#333', cursor: 'text' }}
        >{block.content}</div>

        {!isFocused && (
          <div 
            tabIndex={0}
            onFocus={() => setIsSelected(true)}
            onBlur={() => setIsSelected(false)}
            onPointerDown={(e) => { e.currentTarget.focus(); handlePointerDown(e); }}
            onKeyDown={(e) => { if (e.key === 'Delete' || e.key === 'Backspace') { e.stopPropagation(); onRemove(block.id); } }}
            onDoubleClick={(e) => { e.stopPropagation(); if (mode === 'write' || mode === 'select') setIsFocused(true); }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: (mode === 'write' || mode === 'select') ? 'grab' : 'default', zIndex: 10, outline: 'none' }}
          />
        )}

        {isSelected && !isFocused && (mode === 'write' || mode === 'select') && (
          <div 
            onPointerDown={startResize} 
            style={{ position: 'absolute', right: -5, bottom: -5, width: 12, height: 12, background: '#00bfff', cursor: 'nwse-resize', borderRadius: '50%', zIndex: 20, transform: `scale(${1/scale})` }} 
          />
        )}
      </div>
  );
};
