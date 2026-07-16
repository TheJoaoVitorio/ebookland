import { Link } from 'react-router-dom';
import { Hand } from 'lucide-react';

const FeatureCard = ({ title, highlight, items, variant = 'paper' }: any) => {
  const isPostIt = variant === 'postit';
  const isBook = variant === 'book';

  return (
    <div style={{
      width: '100%', maxWidth: '420px',
      backgroundColor: isPostIt ? '#FDFD96' : isBook ? '#F4EDE4' : '#FFF',
      border: isPostIt ? 'none' : '1px solid #DED6D2',
      borderLeft: isBook ? '16px solid #8B5A3B' : isPostIt ? 'none' : '1px solid #DED6D2',
      borderRadius: isPostIt ? '2px 12px 12px 2px' : isBook ? '4px 16px 16px 4px' : '4px',
      padding: '32px 0 16px 0',
      boxShadow: isPostIt 
        ? '5px 5px 15px rgba(0,0,0,0.1), inset -2px -2px 10px rgba(0,0,0,0.05)' 
        : isBook 
          ? '10px 10px 20px rgba(0,0,0,0.15), inset 2px 0 5px rgba(255,255,255,0.5)'
          : '0 8px 30px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column',
      zIndex: 10,
      transform: isPostIt ? 'rotate(-2deg)' : isBook ? 'rotate(1deg)' : 'rotate(0deg)',
      position: 'relative'
    }}>
      {/* Detalhe visual de folha pautada se for paper */}
      {!isPostIt && !isBook && (
        <div style={{ position: 'absolute', left: '24px', top: 0, bottom: 0, width: '1px', backgroundColor: '#FFCCCC' }} />
      )}

      {/* Detalhe de fita adesiva se for postit */}
      {isPostIt && (
        <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%) rotate(-3deg)', width: '80px', height: '20px', backgroundColor: 'rgba(255,255,255,0.4)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
      )}

      <div style={{ padding: '0 32px', marginBottom: '24px', position: 'relative', zIndex: 2 }}>
        <h2 style={{ 
          fontFamily: isPostIt ? '"Kalam", cursive' : '"Caveat", cursive',
          fontSize: isPostIt ? '2.5rem' : '3.2rem', 
          lineHeight: '1.1', fontWeight: 700, color: '#2B1A07', letterSpacing: isPostIt ? '0' : '-1px' 
        }}>
          {title} <br/><span style={{ color: isPostIt ? '#FF6B6B' : '#22C55E' }}>{highlight}</span>
        </h2>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
        {items.map((item: any, idx: number) => (
          <div key={idx} style={{ width: '100%' }}>
            <div style={{ height: '1px', backgroundColor: isPostIt ? 'rgba(0,0,0,0.05)' : 'rgba(43, 26, 7, 0.1)', width: '100%' }} />
            <div style={{ 
              padding: '16px 32px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'default',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span style={{ 
                fontFamily: isPostIt ? '"Kalam", cursive' : '"Caveat", cursive',
                fontSize: isPostIt ? '1.3rem' : '1.6rem', 
                fontWeight: item.active ? 600 : 500, color: item.active ? (isPostIt ? '#FF6B6B' : '#22C55E') : '#2B1A07' 
              }}>
                {item.text}
              </span>
              <span style={{ fontFamily: '"Outfit", serif', fontSize: '1.2rem', fontWeight: 600, color: '#2B1A07', opacity: item.active ? 1 : 0.4 }}>
                {['I', 'II', 'III', 'IV', 'V'][idx]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export function Home() {
  return (
    <div className="snap-container" style={{ backgroundColor: '#FEFCF5', fontFamily: '"Outfit", "Inter", sans-serif' }}>
      
      {/* HEADER FIXO */}
      <header style={{
        position: 'fixed',
        top: '16px', left: '16px', right: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000,
        pointerEvents: 'none' // Allows clicking through the empty space of the header
      }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '10px', color: '#2B1A07', pointerEvents: 'auto',
          backgroundColor: 'rgba(254, 252, 245, 0.8)', padding: '8px 16px', borderRadius: '20px', backdropFilter: 'blur(10px)'
        }}>
          <Hand size={28} strokeWidth={2.5} />
          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-1px' }}>ebooklandia</span>
        </div>
        
        <button style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          backgroundColor: '#111', // Cor de fita isolante preta
          padding: '12px 28px',
          fontFamily: '"Patrick Hand", cursive', // Fonte imitando marcador branco
          fontSize: '1.3rem',
          color: '#FFF',
          cursor: 'pointer',
          boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          transform: 'rotate(2deg)', // Levemente colado torto
          transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          pointerEvents: 'auto',
          position: 'relative',
          clipPath: 'polygon(0% 0%, 100% 0%, 98% 10%, 100% 20%, 98% 30%, 100% 40%, 98% 50%, 100% 60%, 98% 70%, 100% 80%, 98% 90%, 100% 100%, 0% 100%, 2% 90%, 0% 80%, 2% 70%, 0% 60%, 2% 50%, 0% 40%, 2% 30%, 0% 20%, 2% 10%)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'rotate(2deg) scale(1)';
        }}
        >
          {/* Efeito visual de rasgado nas pontas usando clip-path leve */}
          <div style={{ position: 'absolute', inset: 0, borderTop: '1px solid rgba(255,255,255,0.15)', borderBottom: '1px solid rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div style={{ backgroundColor: '#FFF', borderRadius: '50%', padding: '2px', display: 'flex' }}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
          </div>
          <span style={{ letterSpacing: '1px' }}>Entrar com Google</span>
        </button>
      </header>

      {/* SEÇÃO 1: HERO */}
      <section className="snap-section" style={{ padding: '0' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Lado Esquerdo - Textos (Absolute Position) */}
          <div style={{ position: 'absolute', left: '10vw', top: '25vh', zIndex: 10, maxWidth: '500px' }}>
            <p style={{ color: '#F47E3B', fontFamily: '"Caveat", cursive', fontSize: '1.8rem', margin: '0 0 -10px 0', transform: 'rotate(-4deg)' }}>Dear grownups,</p>
            
            <h1 style={{ fontSize: '7rem', lineHeight: '0.9', color: '#2B1A07', margin: '0 0 2rem 0', fontWeight: 900, letterSpacing: '-4px' }}>
              meet<br/>ebooklandia
            </h1>
            
            <p style={{ fontSize: '1.6rem', color: '#2B1A07', lineHeight: '1.3', margin: '0 0 3rem 0', fontWeight: 500 }}>
              O caderno digital que <span style={{ color: '#F47E3B', fontFamily: '"Caveat", cursive', fontSize: '2rem', fontStyle: 'italic' }}>actually!</span><br/>
              te dá liberdade total.
            </p>

            <Link to="/workspace" style={{ textDecoration: 'none' }}>
              <button style={{
                backgroundColor: '#FEFCF5',
                border: '2px solid #2B1A07',
                color: '#2B1A07',
                padding: '14px 36px',
                fontSize: '1.2rem',
                fontWeight: 700,
                borderRadius: '30px',
                cursor: 'pointer',
                boxShadow: '4px 4px 0px rgba(43, 26, 7, 0.1)',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '6px 6px 0px rgba(43, 26, 7, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '4px 4px 0px rgba(43, 26, 7, 0.1)';
              }}
              >
                Quero conhecer! iupiii!!!
              </button>
            </Link>
          </div>

          {/* Ilustração Caderno Centralizado no Fundo */}
          <div style={{ position: 'absolute', right: '15vw', top: '50%', transform: 'translateY(-50%)' }}>
             <div style={{
              width: '450px', height: '600px', backgroundColor: '#A87A5B',
              borderRadius: '16px 24px 24px 16px',
              boxShadow: '-10px 15px 30px rgba(0,0,0,0.15), inset 2px 0 5px rgba(255,255,255,0.2)',
              transform: 'rotate(8deg)', position: 'relative',
              borderRight: '12px solid #8B5A3B', borderTop: '2px solid #C8997A', borderBottom: '4px solid #8B5A3B'
            }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-4deg)',
                width: '260px', height: '150px', backgroundColor: '#FEFCF5', borderRadius: '8px', border: '2px solid #2B1A07', padding: '16px', display: 'flex', flexDirection: 'column', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
              }}>
                <div style={{ border: '1px solid #2B1A07', width: '100%', height: '100%', borderRadius: '4px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 2, borderBottom: '1px solid #2B1A07', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2B1A07' }}>Name</span>
                    <span style={{ marginLeft: '20px', fontFamily: '"Caveat", cursive', fontSize: '2.2rem', color: '#2B1A07' }}>João</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex' }}>
                    <div style={{ flex: 1, borderRight: '1px solid #2B1A07', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2B1A07' }}>Class</span>
                      <span style={{ marginLeft: '10px', fontSize: '1rem', fontWeight: 800, color: '#2B1A07' }}>VIII-A</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: CANVAS LIVRE (PADRÃO SUPERR) */}
      <section className="snap-section" style={{ backgroundColor: '#FEFCF5' }}>
        {/* Full Screen Background */}
        <div style={{ 
          position: 'absolute', inset: 0, zIndex: 1,
          backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', 
          backgroundSize: '24px 24px', backgroundPosition: '12px 12px',
          opacity: 0.8
        }}>
          {/* Elementos flutuantes simulando o Canvas */}
          <div style={{ position: 'absolute', top: '25%', left: '45%', padding: '12px 24px', border: '2px dashed #3B82F6', borderRadius: '8px', background: 'rgba(255,255,255,0.9)', fontFamily: '"Caveat", cursive', fontSize: '2.2rem', color: '#2B1A07', transform: 'rotate(-2deg)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            Clique em qualquer lugar
          </div>
          <div style={{ position: 'absolute', top: '55%', left: '60%', padding: '12px 24px', border: '1px solid transparent', fontFamily: '"Kalam", cursive', fontSize: '1.8rem', color: '#2B1A07', transform: 'rotate(3deg)' }}>
            E arraste livremente!
          </div>
          <div style={{ position: 'absolute', top: '75%', left: '40%', padding: '12px 24px', border: '1px solid transparent', fontFamily: '"Caveat", cursive', fontSize: '2rem', color: '#2B1A07', transform: 'rotate(-1deg)', opacity: 0.5 }}>
            (Igual num quadro branco)
          </div>
        </div>

        {/* Floating Card */}
        <div style={{ position: 'absolute', top: '50%', left: '8vw', transform: 'translateY(-50%)', zIndex: 10 }}>
          <FeatureCard 
            variant="postit"
            title="Sinta-se num"
            highlight="quadro branco"
            items={[
              { text: 'Sem linhas restritivas', active: true },
              { text: 'Crie caixas onde quiser', active: false },
              { text: 'Arraste livremente', active: false },
              { text: 'Organize suas ideias', active: false }
            ]}
          />
        </div>
      </section>

      {/* SEÇÃO 3: FONTES MANUSCRITAS (PADRÃO SUPERR) */}
      <section className="snap-section" style={{ backgroundColor: '#F9F5EC' }}>
        {/* Full Screen Background */}
        <div style={{ 
          position: 'absolute', inset: 0, zIndex: 1,
          backgroundImage: 'linear-gradient(#e0e0e0 1px, transparent 1px)', 
          backgroundSize: '100% 32px', backgroundPosition: '0 32px'
        }}>
          <div style={{ position: 'absolute', top: '20%', left: '15%', fontFamily: '"Caveat", cursive', fontSize: '3rem', color: '#2B1A07', transform: 'rotate(-1deg)' }}>
            Uma coleção de caligrafias.
          </div>
          <div style={{ position: 'absolute', top: '40%', left: '20%', fontFamily: '"Kalam", cursive', fontSize: '2.5rem', color: '#F47E3B', transform: 'rotate(2deg)' }}>
            Para você expressar sua personalidade...
          </div>
          <div style={{ position: 'absolute', top: '65%', left: '10%', fontFamily: '"Shadows Into Light", cursive', fontSize: '3.5rem', color: '#22C55E', transform: 'rotate(-2deg)' }}>
            Sem perder a vibe do papel.
          </div>
        </div>

        {/* Floating Card */}
        <div style={{ position: 'absolute', top: '50%', right: '8vw', transform: 'translateY(-50%)', zIndex: 10 }}>
          <FeatureCard 
            variant="paper"
            title="A sua letra,"
            highlight="do seu jeito"
            items={[
              { text: 'Sensação de papel real', active: true },
              { text: 'Tipografias do Google Fonts', active: false },
              { text: 'Caveat, Kalam e muito mais', active: false },
              { text: 'Troque no menu flutuante', active: false }
            ]}
          />
        </div>
      </section>

      {/* SEÇÃO 4: SALVAMENTO (REFORMULADA) */}
      <section className="snap-section" style={{ backgroundColor: '#E0F2FE', overflow: 'hidden' }}>
        {/* Full Screen Background - Sky & Clouds */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          {/* Nuvens decorativas */}
          <div style={{ position: 'absolute', top: '15%', left: '5%', opacity: 0.6 }}>
            <svg width="120" height="80" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
          </div>
          <div style={{ position: 'absolute', top: '45%', left: '35%', opacity: 0.4, transform: 'scale(1.5)' }}>
            <svg width="120" height="80" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
          </div>
          <div style={{ position: 'absolute', top: '75%', left: '15%', opacity: 0.5, transform: 'scale(0.8)' }}>
            <svg width="120" height="80" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
          </div>
          
          <div style={{ position: 'absolute', top: '35%', left: '8vw', maxWidth: '500px' }}>
            <h2 style={{ fontFamily: '"Kalam", cursive', fontSize: '5rem', lineHeight: '1', color: '#0284C7', transform: 'rotate(-3deg)' }}>
              Relaxa...<br/>
              <span style={{ color: '#0369A1' }}>Tá tudo salvo.</span>
            </h2>
            <p style={{ fontFamily: '"Caveat", cursive', fontSize: '2.5rem', color: '#0EA5E9', marginTop: '20px', transform: 'rotate(-2deg)' }}>
              Nas nuvens! ☁️
            </p>
          </div>
        </div>

        {/* Floating Card - Livro */}
        <div style={{ position: 'absolute', top: '50%', right: '8vw', transform: 'translateY(-50%)', zIndex: 10 }}>
          <div style={{
            width: '100%', minWidth: '420px',
            backgroundColor: '#F4EDE4',
            border: '1px solid #DED6D2',
            borderLeft: '16px solid #A87A5B',
            borderRadius: '4px 16px 16px 4px',
            padding: '32px 0 16px 0',
            boxShadow: '10px 10px 30px rgba(0,20,50,0.15), inset 2px 0 5px rgba(255,255,255,0.5)',
            display: 'flex', flexDirection: 'column',
            transform: 'rotate(2deg)'
          }}>
            <div style={{ padding: '0 32px', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: '"Patrick Hand", cursive', fontSize: '2.5rem', lineHeight: '1.2', fontWeight: 700, color: '#2B1A07', letterSpacing: '0px' }}>
                Proteção <br/><span style={{ color: '#0284C7' }}>automática</span>
              </h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { text: 'Esqueça o botão de salvar', active: true },
                { text: 'Sincronização em tempo real', active: false },
                { text: 'Seus cadernos na nuvem', active: false },
                { text: 'Criptografia de dados de ponta', active: false }
              ].map((item: any, idx: number) => (
                <div key={idx} style={{ width: '100%' }}>
                  <div style={{ height: '1px', backgroundColor: 'rgba(43, 26, 7, 0.1)', width: '100%' }} />
                  <div style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: '"Patrick Hand", cursive', fontSize: '1.4rem', fontWeight: item.active ? 600 : 500, color: item.active ? '#0284C7' : '#2B1A07' }}>
                      {item.text}
                    </span>
                    <span style={{ fontFamily: '"Outfit", serif', fontSize: '1.2rem', fontWeight: 600, color: '#2B1A07', opacity: item.active ? 1 : 0.4 }}>
                      {['I', 'II', 'III', 'IV'][idx]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
               <Link to="/workspace" style={{ textDecoration: 'none', width: '100%' }}>
                  <button style={{
                    width: '100%',
                    backgroundColor: '#F47E3B',
                    border: 'none',
                    color: '#FFF',
                    padding: '16px 32px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: '30px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(244, 126, 59, 0.3)',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Comece a escrever agora
                  </button>
                </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
