import { Link } from 'react-router-dom';
import { Hand } from 'lucide-react';

export function Home() {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#FEFCF5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: '"Outfit", "Inter", sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4rem',
        zIndex: 2
      }}>
        
        {/* Lado Esquerdo - Textos */}
        <div style={{ flex: 1, paddingRight: '4rem' }}>
          <p style={{
            color: '#F47E3B',
            fontFamily: '"Caveat", "Comic Sans MS", cursive',
            fontSize: '1.5rem',
            margin: '0 0 -10px 0',
            transform: 'rotate(-2deg)'
          }}>Dear grownups,</p>
          
          <h1 style={{
            fontSize: '6.5rem',
            lineHeight: '0.9',
            color: '#342312',
            margin: '0 0 2rem 0',
            fontWeight: 900,
            letterSpacing: '-3px'
          }}>
            meet<br/>ebooklandia
          </h1>
          
          <p style={{
            fontSize: '1.4rem',
            color: '#212121',
            lineHeight: '1.4',
            margin: '0 0 3rem 0',
            fontWeight: 500
          }}>
            É um caderno de IA que <span style={{ color: '#F47E3B', fontFamily: '"Caveat", cursive', fontSize: '1.8rem', fontStyle: 'italic' }}>actually!</span><br/>
            Torna o aprendizado divertido
          </p>

          <Link to="/workspace" style={{ textDecoration: 'none' }}>
            <button style={{
              backgroundColor: '#FEFCF5',
              border: '2px solid #342312',
              color: '#342312',
              padding: '12px 32px',
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: '24px',
              cursor: 'pointer',
              boxShadow: '4px 4px 0px rgba(52, 35, 18, 0.1)',
              transition: 'transform 0.1s ease',
            }}>
              Eu fico com a prioridade!
            </button>
          </Link>
          
          <p style={{
            color: '#A09E96',
            fontSize: '0.9rem',
            marginTop: '1.5rem',
            fontWeight: 500
          }}>
            Pré-venda a partir de junho de 2026
          </p>
        </div>

        {/* Lado Direito - Ilustração Caderno 3D */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          position: 'relative'
        }}>
          {/* Caderno Fechado */}
          <div style={{
            width: '400px',
            height: '550px',
            backgroundColor: '#A87A5B',
            borderRadius: '16px 24px 24px 16px',
            boxShadow: '-10px 15px 30px rgba(0,0,0,0.15), inset 2px 0 5px rgba(255,255,255,0.2)',
            transform: 'rotate(12deg)',
            position: 'relative',
            borderRight: '12px solid #8B5A3B',
            borderTop: '2px solid #C8997A',
            borderBottom: '4px solid #8B5A3B'
          }}>
            
            {/* Etiqueta da Escola */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-4deg)',
              width: '240px',
              height: '140px',
              backgroundColor: '#FEFCF5',
              borderRadius: '8px',
              border: '2px solid #342312',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
            }}>
              {/* Moldura dupla da etiqueta */}
              <div style={{
                border: '1px solid #342312',
                width: '100%',
                height: '100%',
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ flex: 2, borderBottom: '1px solid #342312', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#342312' }}>Name</span>
                  <span style={{ marginLeft: '20px', fontFamily: '"Caveat", cursive', fontSize: '2rem', color: '#342312' }}>Param</span>
                </div>
                <div style={{ flex: 1, display: 'flex' }}>
                  <div style={{ flex: 1, borderRight: '1px solid #342312', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#342312' }}>Class</span>
                    <span style={{ marginLeft: '10px', fontSize: '0.9rem', fontWeight: 800, color: '#342312' }}>VIII-A</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#342312' }}>Roll no.</span>
                    <span style={{ marginLeft: '10px', fontSize: '1rem', fontWeight: 800, color: '#342312' }}>20</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Suporte Lápis (Couro) */}
            <div style={{
              position: 'absolute',
              right: '-20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '30px',
              height: '100px',
              backgroundColor: '#8B5A3B',
              borderRadius: '0 8px 8px 0',
              boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.2)'
            }} />

            {/* Lápis Amarelo */}
            <div style={{
              position: 'absolute',
              right: '-16px',
              top: '40%',
              width: '20px',
              height: '280px',
              background: 'linear-gradient(90deg, #FFC107 40%, #FFB300 60%, #FFA000 100%)',
              borderRadius: '2px',
              boxShadow: '5px 5px 15px rgba(0,0,0,0.2)',
              zIndex: -1
            }}>
              <div style={{
                position: 'absolute', top: '-15px', left: '0', width: '100%', height: '15px',
                backgroundColor: '#FF5252', borderRadius: '4px 4px 0 0', borderBottom: '3px solid #B0BEC5'
              }} />
              <div style={{
                position: 'absolute', bottom: '-20px', left: '0', width: '0', height: '0',
                borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '20px solid #D7CCC8'
              }} />
              <div style={{
                position: 'absolute', bottom: '-20px', left: '8px', width: '0', height: '0',
                borderLeft: '2px solid transparent', borderRight: '2px solid transparent', borderTop: '4px solid #424242'
              }} />
            </div>

          </div>
        </div>
      </div>
      
      {/* Icone do Logo Superior Esquerdo */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        color: '#342312'
      }}>
        <Hand size={42} strokeWidth={2.5} />
      </div>
    </div>
  );
}
