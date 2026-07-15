import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Book, X, Trash2, Check } from 'lucide-react';

interface NotebookData {
  id: string;
  title: string;
  coverColor: string;
  folderId?: string;
}

interface FolderData {
  id: string;
  name: string;
  color: string;
  notebooks: NotebookData[];
}

const COLORS = [
  { id: 'white', hex: '#FFFFFF' },
  { id: 'lime', hex: '#E6F564' },
  { id: 'yellow', hex: '#FFC107' },
  { id: 'orange', hex: '#FF7043' },
  { id: 'pink', hex: '#F8BBD0' },
];

export function Workspace() {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [standaloneNotebooks, setStandaloneNotebooks] = useState<NotebookData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].hex);

  const navigate = useNavigate();

  const fetchWorkspace = () => {
    fetch('http://localhost:3001/api/workspace')
      .then(res => res.json())
      .then(data => {
        setFolders(data.folders);
        setStandaloneNotebooks(data.standaloneNotebooks);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const handleCreateNotebook = async () => {
    if (!newNotebookTitle.trim()) return;
    await fetch('http://localhost:3001/api/notebooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newNotebookTitle, coverColor: selectedColor })
    });
    setNewNotebookTitle('');
    setIsCreating(false);
    fetchWorkspace();
  };

  const createFolder = async () => {
    const name = prompt('Nome da Pasta:');
    if (!name) return;
    await fetch('http://localhost:3001/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color: '#E0E0E0' })
    });
    fetchWorkspace();
  };

  if (loading) return <div style={{ padding: '2rem' }}>Carregando biblioteca...</div>;

  // View de Criação (Inline Modal)
  if (isCreating) {
    return (
      <div style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', backgroundColor: '#F8F9FA' }}>
        <button 
          onClick={() => setIsCreating(false)}
          style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
        >
          <X size={24} />
        </button>

        {/* Central Input Card */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ 
            width: '100%', maxWidth: '600px', backgroundColor: '#FFF', 
            borderRadius: '16px', border: '1px solid #E0E0E0', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative',
            padding: '4rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <button 
              onClick={() => setNewNotebookTitle('')}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#FF5252' }}
            >
              <Trash2 size={20} />
            </button>
            <input 
              type="text" 
              value={newNotebookTitle}
              onChange={(e) => setNewNotebookTitle(e.target.value)}
              placeholder="Rabisco o nome de um caderno"
              autoFocus
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                fontSize: '2rem', fontFamily: '"Caveat", cursive', textAlign: 'center',
                color: '#888', width: '100%'
              }}
            />
          </div>
        </div>

        {/* Bottom Drawer */}
        <div style={{ 
          backgroundColor: '#FFF', borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
          padding: '2rem', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
          border: '1px solid #E0E0E0', borderBottom: 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#333' }}>Novo Caderno</h3>
            <button 
              onClick={handleCreateNotebook}
              style={{ 
                backgroundColor: '#000', color: '#FFF', border: 'none', borderRadius: '24px',
                padding: '8px 24px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Criar
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            {COLORS.map(c => (
              <div 
                key={c.id}
                onClick={() => setSelectedColor(c.hex)}
                style={{
                  width: '70px', height: '100px', backgroundColor: c.hex,
                  borderRadius: '8px', cursor: 'pointer', position: 'relative',
                  border: '1px solid #E0E0E0',
                  boxShadow: selectedColor === c.hex ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                  transform: selectedColor === c.hex ? 'translateY(-5px)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {selectedColor === c.hex && (
                  <div style={{ position: 'absolute', top: '5px', right: '5px', backgroundColor: '#000', borderRadius: '50%', padding: '2px', color: '#FFF', display: 'flex' }}>
                    <Check size={12} strokeWidth={4} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // View de Biblioteca
  return (
    <div style={{ padding: '2rem', height: '100%', overflowY: 'auto', backgroundColor: '#F8F9FA' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#333', fontWeight: 700 }}>Minhas Anotações</h1>
          <p style={{ margin: '5px 0 0 0', color: '#888' }}>Biblioteca</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={createFolder} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
            backgroundColor: '#FFF', border: '1px solid #E0E0E0', borderRadius: '8px', cursor: 'pointer',
            fontWeight: 600, color: '#555', boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
          }}>
            <Folder size={18} /> Pasta
          </button>
          <button onClick={() => setIsCreating(true)} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
            backgroundColor: '#000', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <Book size={18} /> Caderno
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '30px' }}>
        {folders.map(folder => (
          <div key={folder.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              width: '180px', height: '140px', backgroundColor: folder.color,
              borderRadius: '0 12px 12px 12px', position: 'relative',
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)', cursor: 'pointer'
            }}>
              <div style={{
                position: 'absolute', top: '-15px', left: '0', width: '60px', height: '15px',
                backgroundColor: folder.color, borderRadius: '8px 8px 0 0'
              }} />
              <div style={{ padding: '15px', color: '#333', fontWeight: 600 }}>{folder.name}</div>
            </div>
          </div>
        ))}

        {standaloneNotebooks.map(notebook => (
          <div key={notebook.id} onClick={() => navigate(`/reader/${notebook.id}`)} style={{ 
            width: '160px', height: '220px', backgroundColor: notebook.coverColor,
            borderRadius: '4px 12px 12px 4px', position: 'relative',
            boxShadow: '4px 4px 10px rgba(0,0,0,0.1), inset 3px 0 5px rgba(255,255,255,0.3)',
            cursor: 'pointer', borderLeft: '8px solid rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '15px', color: '#333', fontWeight: 700, fontFamily: '"Caveat", cursive', fontSize: '1.4rem', textAlign: 'center', marginTop: '20px' }}>
              {notebook.title}
            </div>
            <div style={{
              position: 'absolute', bottom: '20px', left: 0, width: '100%', height: '30px',
              backgroundColor: 'rgba(255,255,255,0.2)'
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}
