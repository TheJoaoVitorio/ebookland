import { useEffect, useState } from 'react';

export const PaperAirplaneToast = ({ show, name }: { show: boolean, name: string }) => {
  const [render, setRender] = useState(show);

  useEffect(() => {
    if (show) setRender(true);
    else {
      const timer = setTimeout(() => setRender(false), 1500); // Wait for exit animation
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!render) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '40px',
      left: 0,
      right: 0,
      pointerEvents: 'none',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center'
    }}>
      <style>{`
        @keyframes flyAcross {
          0% { transform: translateX(-50vw) translateY(80px) rotate(5deg); opacity: 0; }
          15% { transform: translateX(10vw) translateY(10px) rotate(0deg); opacity: 1; }
          85% { transform: translateX(60vw) translateY(-10px) rotate(-2deg); opacity: 1; }
          100% { transform: translateX(120vw) translateY(-60px) rotate(-10deg); opacity: 0; }
        }
        @keyframes bannerWaving {
          0% { transform: rotate(-2deg) skewY(1deg); }
          100% { transform: rotate(2deg) skewY(-1deg); }
        }
        @keyframes planeBobbing {
          0% { transform: translateY(-5px) rotate(15deg); }
          100% { transform: translateY(5px) rotate(10deg); }
        }
      `}</style>
      
      <div style={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        animation: 'flyAcross 4.5s ease-in-out forwards'
      }}>
        
        {/* Banner / Faixa */}
        <div style={{
          position: 'relative',
          background: '#FFF',
          border: '2px solid #2B1A07',
          padding: '8px 24px',
          fontFamily: '"Caveat", cursive',
          fontSize: '2rem',
          color: '#2B1A07',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.1)',
          marginRight: '25px',
          animation: 'bannerWaving 1s alternate infinite ease-in-out'
        }}>
          Boas-vindas, {name}!
          
          {/* Cordinhas puxando a faixa */}
          <svg style={{ position: 'absolute', right: '-27px', top: '50%', transform: 'translateY(-50%)', width: '28px', height: '100%', overflow: 'visible' }}>
            <line x1="0" y1="10" x2="28" y2="50%" stroke="#2B1A07" strokeWidth="2" />
            <line x1="0" y1="100%" x2="28" y2="50%" stroke="#2B1A07" strokeWidth="2" />
          </svg>
        </div>

        {/* Avião de Papel 3D */}
        <div style={{ animation: 'planeBobbing 0.8s alternate infinite ease-in-out', zIndex: 2 }}>
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
            width="90px" height="auto" viewBox="0 0 1131.53 379.304"
            style={{ display: 'block' }}>
            <polygon fill="#F47E3B" points="72.008,0 274.113,140.173 274.113,301.804 390.796,221.102 601.682,367.302 1131.53,0.223" />
            <polygon fill="#D35A15" points="1131.53,0.223 274.113,140.173 274.113,301.804 390.796,221.102" />
          </svg>
        </div>

      </div>
    </div>
  );
};
