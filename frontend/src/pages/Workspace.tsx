import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Book, X, Trash2, Check, Edit2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, deleteField } from 'firebase/firestore';

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
  
  // Action State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [itemType, setItemType] = useState<'notebook' | 'folder'>('notebook');
  const [editId, setEditId] = useState<string | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].hex);

  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const fetchWorkspace = async () => {
    if (!user) return;
    try {
      const foldersSnap = await getDocs(collection(db, `users/${user.uid}/folders`));
      const notebooksSnap = await getDocs(collection(db, `users/${user.uid}/notebooks`));
      
      const allNotebooks = notebooksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NotebookData[];
      const sNotebooks = allNotebooks.filter(n => !n.folderId);
      
      const fData = foldersSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          notebooks: allNotebooks.filter(n => n.folderId === doc.id)
        };
      }) as FolderData[];
      
      setFolders(fData);
      setStandaloneNotebooks(sNotebooks);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar dados", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchWorkspace();
  }, [user]);

  const openCreateModal = (type: 'notebook' | 'folder') => {
    setModalMode('create');
    setItemType(type);
    setItemTitle('');
    setSelectedColor(COLORS[0].hex);
    setIsModalOpen(true);
  };

  const openEditModal = (type: 'notebook' | 'folder', item: any) => {
    setModalMode('edit');
    setItemType(type);
    setEditId(item.id);
    setItemTitle(type === 'notebook' ? item.title : item.name);
    setSelectedColor(type === 'notebook' ? item.coverColor : item.color);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!itemTitle.trim() || !user) return;
    
    if (modalMode === 'create') {
      if (itemType === 'notebook') {
        await addDoc(collection(db, `users/${user.uid}/notebooks`), { title: itemTitle, coverColor: selectedColor, createdAt: Date.now() });
      } else {
        await addDoc(collection(db, `users/${user.uid}/folders`), { name: itemTitle, color: selectedColor, createdAt: Date.now() });
      }
    } else if (modalMode === 'edit' && editId) {
      if (itemType === 'notebook') {
        await updateDoc(doc(db, `users/${user.uid}/notebooks`, editId), { title: itemTitle, coverColor: selectedColor });
      } else {
        await updateDoc(doc(db, `users/${user.uid}/folders`, editId), { name: itemTitle, color: selectedColor });
      }
    }
    
    setIsModalOpen(false);
    fetchWorkspace();
  };

  const handleDelete = async (type: 'notebook' | 'folder', id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (!window.confirm(`Tem certeza que deseja excluir est${type === 'notebook' ? 'e caderno' : 'a pasta'}?`)) return;

    if (type === 'notebook') {
      await deleteDoc(doc(db, `users/${user.uid}/notebooks`, id));
    } else {
      // Remover referências de cadernos atrelados (torná-los independentes)
      const targetFolder = folders.find(f => f.id === id);
      if (targetFolder && targetFolder.notebooks) {
        for (const n of targetFolder.notebooks) {
          await updateDoc(doc(db, `users/${user.uid}/notebooks`, n.id), { folderId: deleteField() });
        }
      }
      await deleteDoc(doc(db, `users/${user.uid}/folders`, id));
    }
    fetchWorkspace();
  };

  if (loading) return <div style={{ padding: '2rem' }}>Carregando biblioteca...</div>;

  // View de Ação (Inline Modal)
  if (isModalOpen) {
    return (
      <div style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', backgroundColor: '#F8F9FA' }}>
        <button 
          onClick={() => setIsModalOpen(false)}
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
              onClick={() => setItemTitle('')}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#FF5252' }}
            >
              <Trash2 size={20} />
            </button>
            <input 
              type="text" 
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              placeholder={`Nome d${itemType === 'notebook' ? 'o caderno' : 'a pasta'}`}
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
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#333' }}>
              {modalMode === 'create' ? 'Novo' : 'Editar'} {itemType === 'notebook' ? 'Caderno' : 'Pasta'}
            </h3>
            <button 
              onClick={handleSave}
              style={{ 
                backgroundColor: '#000', color: '#FFF', border: 'none', borderRadius: '24px',
                padding: '8px 24px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              {modalMode === 'create' ? 'Criar' : 'Salvar'}
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          
          {/* User Avatar */}
          {user && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px', marginRight: '10px' }}>
              <div 
                title="Sair da conta"
                onClick={logout}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: user.photoURL ? `url(${user.photoURL}) center/cover` : '#E6F564',
                  border: '2px solid #2B1A07', cursor: 'pointer',
                  boxShadow: '2px 2px 0px rgba(43,26,7,0.1)'
                }}
              />
            </div>
          )}

          <button onClick={() => openCreateModal('folder')} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
            backgroundColor: '#FFF', border: '1px solid #E0E0E0', borderRadius: '8px', cursor: 'pointer',
            fontWeight: 600, color: '#555', boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
          }}>
            <Folder size={18} /> Pasta
          </button>
          <button onClick={() => openCreateModal('notebook')} style={{
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
            <div className="cursor-pointer" style={{ 
              width: '180px', height: '140px', backgroundColor: folder.color,
              borderRadius: '0 12px 12px 12px', position: 'relative',
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)', cursor: 'pointer'
            }}>
              <div style={{
                position: 'absolute', top: '-15px', left: '0', width: '60px', height: '15px',
                backgroundColor: folder.color, borderRadius: '8px 8px 0 0'
              }} />
              
              <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                <button title="Editar Pasta" onClick={(e) => { e.stopPropagation(); openEditModal('folder', folder); }} style={{ background: 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}><Edit2 size={14} color="#333" /></button>
                <button title="Excluir Pasta" onClick={(e) => handleDelete('folder', folder.id, e)} style={{ background: 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}><Trash2 size={14} color="#FF5252" /></button>
              </div>

              <div style={{ padding: '15px', color: '#333', fontWeight: 600, marginTop: '20px' }}>{folder.name}</div>
            </div>
          </div>
        ))}

        {standaloneNotebooks.map(notebook => (
          <div key={notebook.id} onClick={() => navigate(`/reader/${notebook.id}`)} className="cursor-pointer" style={{ 
            width: '160px', height: '220px', backgroundColor: notebook.coverColor,
            borderRadius: '4px 12px 12px 4px', position: 'relative',
            boxShadow: '4px 4px 10px rgba(0,0,0,0.1), inset 3px 0 5px rgba(255,255,255,0.3)',
            cursor: 'pointer', borderLeft: '8px solid rgba(0,0,0,0.1)'
          }}>
            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px', zIndex: 5 }}>
              <button title="Editar Caderno" onClick={(e) => { e.stopPropagation(); openEditModal('notebook', notebook); }} style={{ background: 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}><Edit2 size={14} color="#333" /></button>
              <button title="Excluir Caderno" onClick={(e) => handleDelete('notebook', notebook.id, e)} style={{ background: 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}><Trash2 size={14} color="#FF5252" /></button>
            </div>
            
            <div style={{ padding: '15px', color: '#333', fontWeight: 700, fontFamily: '"Caveat", cursive', fontSize: '1.4rem', textAlign: 'center', marginTop: '30px' }}>
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
