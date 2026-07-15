import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Ebook {
  id: string;
  title: string;
  author: string;
  coverColor: string;
}

export function Library() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/ebooks')
      .then((res) => res.json())
      .then((data) => {
        setEbooks(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching ebooks:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Minha Biblioteca</h1>
        <Link to="/">
          <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '1rem' }}>Voltar</button>
        </Link>
      </div>

      {loading ? (
        <p>Carregando seus livros mágicos...</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '2rem' 
        }}>
          {ebooks.map((ebook) => (
            <Link key={ebook.id} to={`/reader/${ebook.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div 
                className="magic-card" 
                style={{ 
                  height: '280px', 
                  backgroundColor: ebook.coverColor,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  cursor: 'pointer'
                }}
              >
                <div style={{ 
                  backgroundColor: 'var(--color-surface)', 
                  padding: '12px', 
                  borderRadius: '8px',
                  marginTop: 'auto'
                }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{ebook.title}</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{ebook.author}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
