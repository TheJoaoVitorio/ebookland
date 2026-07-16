import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Book, X, Trash2, Check, Edit2, MoreVertical, Heart, Library, ArrowUpDown, Clock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, deleteField } from 'firebase/firestore';

interface NotebookData {
  id: string;
  title: string;
  coverColor: string;
  folderId?: string;
  createdAt?: number;
}

interface FolderData {
  id: string;
  name: string;
  color: string;
  notebooks: NotebookData[];
  createdAt?: number;
}

const FOLDER_COLORS = [
  { id: 'purple', hex: '#6366F1' },
  { id: 'yellow', hex: '#FACC15' },
  { id: 'pink', hex: '#F472B6' },
  { id: 'orange', hex: '#FB923C' },
  { id: 'gray', hex: '#9CA3AF' },
];

const COVERS = [
  // Stickies and Patterns
  { id: 'sticky-yellow', label: 'Post-it', type: 'sticky', color: '#FDE047' },
  { id: 'polka-pink', label: 'Bolinhas', type: 'polka', color: '#FFF' },
  { id: 'grid-dark', label: 'Grid', type: 'grid', color: '#1F2937' },
  
  // Halves
  { id: 'half-blue', label: 'Azul Clássico', type: 'half', color: '#3B82F6' },
  { id: 'half-orange', label: 'Laranja', type: 'half', color: '#F97316' },
  { id: 'half-lime', label: 'Metade Verde', type: 'half', color: '#D9F99D' },
  { id: 'half-black', label: 'Metade Preto', type: 'half', color: '#171717' },

  // Solids with Spines
  { id: 'solid-blue', label: 'Azul Sólido', type: 'solid', color: '#4F46E5', textColor: '#FFF' },
  { id: 'solid-brown', label: 'Couro', type: 'solid', color: '#B4846C', textColor: '#FFF' },
  { id: 'solid-yellow', label: 'Amarelo', type: 'solid', color: '#FACC15', textColor: '#000' },
  
  // Spine colors
  { id: 'spine-blue', label: 'Lombada Azul', type: 'spine-color', color: '#FDFBF7', spineColor: '#93C5FD', textColor: '#000' },
  { id: 'spine-pink', label: 'Lombada Rosa', type: 'spine-color', color: '#FDFBF7', spineColor: '#F9A8D4', textColor: '#000' },

  // Art Patterns
  { id: 'floral', label: 'Floral', type: 'floral', color: '#FFF' },
  { id: 'clouds', label: 'Nuvens', type: 'clouds', color: '#38BDF8' }
];

export function Workspace() {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [standaloneNotebooks, setStandaloneNotebooks] = useState<NotebookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  
  // Action State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [itemType, setItemType] = useState<'notebook' | 'folder'>('notebook');
  const [editId, setEditId] = useState<string | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0].hex);
  const [selectedCover, setSelectedCover] = useState(COVERS[0].id);

  // Filters & Sorting
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filterView, setFilterView] = useState<'everything' | 'notebooks' | 'folders'>('everything');
  const [sortView, setSortView] = useState<'lastModified' | 'alphabetical'>('lastModified');

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
    setSelectedColor(FOLDER_COLORS[0].hex);
    setSelectedCover(COVERS[0].id);
    setIsModalOpen(true);
  };

  const openEditModal = (type: 'notebook' | 'folder', item: any) => {
    setModalMode('edit');
    setItemType(type);
    setEditId(item.id);
    setItemTitle(type === 'notebook' ? item.title : item.name);
    if (type === 'notebook') setSelectedCover(item.coverColor);
    else setSelectedColor(item.color);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!itemTitle.trim() || !user) return;
    
    if (modalMode === 'create') {
      if (itemType === 'notebook') {
        const data: any = { title: itemTitle, coverColor: selectedCover, createdAt: Date.now() };
        if (activeFolderId) data.folderId = activeFolderId;
        await addDoc(collection(db, `users/${user.uid}/notebooks`), data);
      } else {
        await addDoc(collection(db, `users/${user.uid}/folders`), { name: itemTitle, color: selectedColor, createdAt: Date.now() });
      }
    } else if (modalMode === 'edit' && editId) {
      if (itemType === 'notebook') {
        await updateDoc(doc(db, `users/${user.uid}/notebooks`, editId), { title: itemTitle, coverColor: selectedCover });
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
      const targetFolder = folders.find(f => f.id === id);
      if (targetFolder && targetFolder.notebooks) {
        for (const n of targetFolder.notebooks) {
          await updateDoc(doc(db, `users/${user.uid}/notebooks`, n.id), { folderId: deleteField() });
        }
      }
      await deleteDoc(doc(db, `users/${user.uid}/folders`, id));
      if (activeFolderId === id) setActiveFolderId(null);
    }
    fetchWorkspace();
  };

  const activeFolder = folders.find(f => f.id === activeFolderId);
  const notebooksToRender = activeFolderId && activeFolder ? activeFolder.notebooks : standaloneNotebooks;

  const sortedFolders = [...folders].sort((a, b) => {
    if (sortView === 'alphabetical') return a.name.localeCompare(b.name);
    return ((b.createdAt as number) || 0) - ((a.createdAt as number) || 0);
  });

  const sortedNotebooks = [...notebooksToRender].sort((a, b) => {
    if (sortView === 'alphabetical') return a.title.localeCompare(b.title);
    return ((b.createdAt as number) || 0) - ((a.createdAt as number) || 0);
  });

  if (loading) return <div style={{ padding: '2rem' }}>Carregando biblioteca...</div>;

  const renderNotebookCover = (coverId: string, title: string) => {
    const cover = COVERS.find(c => c.id === coverId);
    const type = cover ? cover.type : 'half';
    const color = cover ? cover.color : coverId; 
    const textColor = cover?.textColor || '#000';
    const spineColor = cover?.spineColor || 'rgba(0,0,0,0.15)';

    const BaseSpine = () => (
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '12px', backgroundColor: spineColor, borderRight: '1px solid rgba(0,0,0,0.1)', zIndex: 2 }} />
    );

    const PillTitle = ({ text }: { text: string }) => (
      <div style={{ background: '#FFF', border: '1.5px solid #000', borderRadius: '16px', padding: '4px 12px', zIndex: 1, marginTop: '20px' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#000' }}>{text}</div>
      </div>
    );

    const StandardTitle = ({ text, color }: { text: string, color: string }) => (
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color, textAlign: 'center', padding: '0 15px', marginTop: '30px', zIndex: 3, wordBreak: 'break-word' }}>
        {text}
      </div>
    );

    if (type === 'sticky') {
      return (
        <div style={{
          width: '100%', height: '100%', backgroundColor: color, borderRadius: '8px',
          position: 'relative', border: '1.5px solid #000',
          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 25px), calc(100% - 25px) 100%, 0 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
           <div style={{ position: 'absolute', bottom: 0, right: 0, width: '25px', height: '25px', backgroundColor: 'rgba(0,0,0,0.1)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
           <Heart size={16} fill="#EF4444" color="#000" style={{ position: 'absolute', top: '8px', right: '8px' }} />
           <div style={{ fontFamily: '"Caveat", cursive', fontSize: '2.2rem', fontWeight: 700, color: '#000', textAlign: 'center', padding: '0 10px', lineHeight: '1' }}>{title}</div>
        </div>
      );
    }
    
    if (type === 'polka') {
      return (
        <div style={{
          width: '100%', height: '100%', backgroundColor: '#FFF', borderRadius: '8px',
          position: 'relative', border: '1.5px solid #000', overflow: 'hidden',
          backgroundImage: 'radial-gradient(#F8BBD0 20%, transparent 20%), radial-gradient(#E6F564 20%, transparent 20%)',
          backgroundPosition: '0 0, 25px 25px',
          backgroundSize: '50px 50px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10px'
        }}>
           <BaseSpine />
           <Heart size={16} fill="#EF4444" color="#000" style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 2 }} />
           <PillTitle text={title} />
        </div>
      );
    }

    if (type === 'grid') {
      return (
        <div style={{
          width: '100%', height: '100%', backgroundColor: '#222', borderRadius: '8px',
          position: 'relative', border: '1.5px solid #000', overflow: 'hidden',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '15px 15px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '15px'
        }}>
           <BaseSpine />
           <Heart size={16} fill="#EF4444" color="#000" style={{ position: 'absolute', top: '8px', right: '8px' }} />
           <PillTitle text={title} />
        </div>
      );
    }

    if (type === 'solid' || type === 'spine-color') {
      return (
        <div style={{
          width: '100%', height: '100%', backgroundColor: color, borderRadius: '8px',
          position: 'relative', border: '1.5px solid #000', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
           <BaseSpine />
           {type === 'solid' && <Heart size={16} fill="#EF4444" color="#000" style={{ position: 'absolute', top: '8px', right: '8px' }} />}
           <StandardTitle text={title} color={textColor} />
        </div>
      );
    }

    if (type === 'floral') {
      const flowerSvg = encodeURIComponent(`<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><path d="M0 0l50 50M50 0L0 50" stroke="#BFDBFE" stroke-width="0.5" stroke-dasharray="2 2"/><g transform="translate(25, 25)"><circle cx="0" cy="-4" r="2.5" fill="#F87171"/><circle cx="0" cy="4" r="2.5" fill="#F87171"/><circle cx="-4" cy="0" r="2.5" fill="#F87171"/><circle cx="4" cy="0" r="2.5" fill="#F87171"/><circle cx="0" cy="0" r="2" fill="#FACC15"/><path d="M0 5Q-2 10 0 15" stroke="#4ADE80" fill="none" stroke-width="1.5"/></g></svg>`);
      return (
        <div style={{
          width: '100%', height: '100%', backgroundColor: '#FAF9F6', borderRadius: '8px',
          position: 'relative', border: '1.5px solid #000', overflow: 'hidden',
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,${flowerSvg}")`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10px'
        }}>
           <BaseSpine />
           <PillTitle text={title} />
        </div>
      );
    }

    if (type === 'clouds') {
      const cloudSvg = encodeURIComponent(`<svg width="60" height="40" xmlns="http://www.w3.org/2000/svg"><g fill="#FFF"><circle cx="20" cy="20" r="10"/><circle cx="32" cy="16" r="12"/><circle cx="45" cy="22" r="8"/><rect x="20" y="14" width="25" height="16"/></g></svg>`);
      return (
        <div style={{
          width: '100%', height: '100%', backgroundColor: '#38BDF8', borderRadius: '8px',
          position: 'relative', border: '1.5px solid #000', overflow: 'hidden',
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,${cloudSvg}")`,
          backgroundSize: '60px 40px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10px'
        }}>
           <BaseSpine />
           <PillTitle text={title} />
        </div>
      );
    }

    // Default 'half'
    return (
      <div style={{
        width: '100%', height: '100%', backgroundColor: color, borderRadius: '8px',
        position: 'relative', border: '1.5px solid #000', overflow: 'hidden'
      }}>
         <BaseSpine />
         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '45%', backgroundColor: '#FFF', borderBottom: '1.5px solid #000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
           <Heart size={16} fill="#EF4444" color="#000" style={{ position: 'absolute', top: '8px', right: '8px' }} />
           <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#000', textAlign: 'center', padding: '0 15px', marginTop: '10px', wordBreak: 'break-word' }}>{title}</div>
         </div>
      </div>
    );
  };

  return (
    <>
      {/* View de Ação (Overlay Modal ancorado ao device-screen) */}
      {isModalOpen && (
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(255, 255, 255, 0.85)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{ 
            width: '90%', maxWidth: '500px', height: '85%', maxHeight: '650px', 
            backgroundColor: '#FDFBF7', borderRadius: '16px', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: '1px solid #EAEAEA',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative'
          }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '15px', left: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#666', zIndex: 10 }}
            >
              <X size={20} />
            </button>

            {/* Central Input Card */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', paddingTop: '3rem' }}>
              <div style={{ 
                width: '100%', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #EAEAEA', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)', position: 'relative', padding: '3rem 1.5rem', 
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <button 
                  onClick={() => setItemTitle('')}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#FF5252' }}
                >
                  <Trash2 size={16} />
                </button>
                <input 
                  type="text" 
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder={`Scribble a name`}
                  autoFocus
                  style={{
                    border: 'none', background: 'transparent', outline: 'none',
                    fontSize: '1.8rem', fontFamily: '"Caveat", cursive', textAlign: 'center',
                    color: '#999', width: '100%', fontWeight: 700
                  }}
                />
              </div>
            </div>

            {/* Bottom Drawer */}
            <div style={{ 
              backgroundColor: '#FFF', borderTopLeftRadius: '16px', borderTopRightRadius: '16px',
              padding: '1.5rem', boxShadow: '0 -4px 20px rgba(0,0,0,0.03)', border: '1.5px solid #000', borderBottom: 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#000', fontFamily: 'Outfit, sans-serif' }}>
                  {modalMode === 'create' ? 'New' : 'Edit'} {itemType === 'notebook' ? 'Notebook' : 'Folder'}
                </h3>
                <button 
                  onClick={handleSave}
                  style={{ 
                    backgroundColor: '#000', color: '#FFF', border: 'none', borderRadius: '24px',
                    padding: '8px 24px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif'
                  }}
                >
                  {modalMode === 'create' ? 'Create' : 'Save'}
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', paddingTop: '5px' }}>
                {itemType === 'folder' ? (
                  FOLDER_COLORS.map(c => (
                    <div 
                      key={c.id}
                      onClick={() => setSelectedColor(c.hex)}
                      style={{
                        flexShrink: 0, width: '60px', height: '85px', backgroundColor: c.hex,
                        borderRadius: '8px', cursor: 'pointer', position: 'relative', border: '1.5px solid #000',
                        boxShadow: selectedColor === c.hex ? '0 4px 0px #000' : '0 2px 0px rgba(0,0,0,0.1)',
                        transform: selectedColor === c.hex ? 'translateY(-4px)' : 'none', transition: 'all 0.2s ease'
                      }}
                    >
                      {selectedColor === c.hex && (
                        <div style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#FFF', border: '1.5px solid #000', borderRadius: '50%', padding: '2px', color: '#000', display: 'flex' }}>
                          <Check size={12} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  COVERS.map(c => (
                    <div 
                      key={c.id}
                      onClick={() => setSelectedCover(c.id)}
                      style={{
                        flexShrink: 0, width: '70px', height: '100px', cursor: 'pointer', position: 'relative',
                        boxShadow: selectedCover === c.id ? '0 5px 0px #000' : '0 2px 0px rgba(0,0,0,0.1)',
                        transform: selectedCover === c.id ? 'translateY(-5px)' : 'none', transition: 'all 0.2s ease'
                      }}
                    >
                      {renderNotebookCover(c.id, 'Ex.')}
                      {selectedCover === c.id && (
                        <div style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#FFF', border: '1.5px solid #000', borderRadius: '50%', padding: '2px', color: '#000', display: 'flex', zIndex: 10 }}>
                          <Check size={12} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View de Biblioteca */}
      <div style={{ padding: '3rem', height: '100%', overflowY: 'auto', backgroundColor: '#FAFAFA' }}>
        
        {/* HEADER SUPERR.AI STYLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {activeFolderId ? (
            <>
              <button onClick={() => setActiveFolderId(null)} style={{ background: '#FFF', border: '1.5px solid #000', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ArrowLeft size={24} />
              </button>
              <h1 style={{ margin: 0, fontSize: '2.4rem', color: '#000', fontWeight: 500, fontFamily: 'Fraunces' }}>{activeFolder?.name}</h1>
            </>
          ) : (
            <>
              <h1 style={{ margin: 0, fontSize: '2.4rem', color: '#000', fontWeight: 500, fontFamily: 'Fraunces' }}>My Notes</h1>
              <span style={{ fontSize: '2.4rem', color: '#A3A3A3', fontWeight: 500, fontFamily: 'Fraunces' }}>Library</span>
            </>
          )}
        </div>
        
        {/* User Avatar no topo direito, totalmente redondo e com borda */}
        {user && (
          <div 
            title="Sair da conta"
            onClick={logout}
            style={{
              width: '46px', height: '46px', borderRadius: '50%',
              background: user.photoURL ? `url(${user.photoURL}) center/cover` : '#4ADE80',
              border: '1.5px solid #000', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {!user.photoURL && <div style={{width: '24px', height: '24px', background: '#FFF', borderRadius: '12px', border: '1.5px solid #000'}}></div>}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => openCreateModal('notebook')} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px',
            backgroundColor: 'transparent', border: '1.5px solid #000', borderRadius: '20px', cursor: 'pointer',
            fontWeight: 600, color: '#000'
          }}>
            <Book size={16} /> Notebook
          </button>
          
          {!activeFolderId && (
            <button onClick={() => openCreateModal('folder')} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px',
              backgroundColor: 'transparent', border: '1.5px solid #000', borderRadius: '20px', cursor: 'pointer',
              fontWeight: 600, color: '#000'
            }}>
              <Folder size={16} /> Folder
            </button>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', padding: '5px' }}>
            <MoreVertical size={24} />
          </button>
          
          {isMenuOpen && (
            <div style={{ 
              position: 'absolute', top: '40px', right: '0', background: '#FFF', 
              border: '1.5px solid #000', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', 
              width: '240px', zIndex: 50, overflow: 'hidden' 
            }}>
              <div style={{ padding: '8px' }}>
                <button onClick={() => { setFilterView('everything'); setIsMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#000' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Library size={18} /> Everything</div>
                   {filterView === 'everything' && <Check size={18} />}
                </button>
                <button onClick={() => { setFilterView('notebooks'); setIsMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#000' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Book size={18} /> Notebooks</div>
                   {filterView === 'notebooks' && <Check size={18} />}
                </button>
                <button onClick={() => { setFilterView('folders'); setIsMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#000' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Folder size={18} /> Folders</div>
                   {filterView === 'folders' && <Check size={18} />}
                </button>
              </div>
              <div style={{ borderTop: '1.5px solid #000', padding: '8px' }}>
                <button onClick={() => { setSortView('lastModified'); setIsMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#000' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={18} /> Last Modified</div>
                   {sortView === 'lastModified' && <Check size={18} />}
                </button>
                <button onClick={() => { setSortView('alphabetical'); setIsMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#000' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ArrowUpDown size={18} /> Alphabetically</div>
                   {sortView === 'alphabetical' && <Check size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '30px' }}>
        {!activeFolderId && (filterView === 'everything' || filterView === 'folders') && sortedFolders.map(folder => (
          <div key={folder.id} onClick={() => setActiveFolderId(folder.id)} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="cursor-pointer" style={{ 
              width: '100%', height: '200px', position: 'relative', paddingTop: '15px'
            }}>
              {/* Folder Tab */}
              <div style={{
                position: 'absolute', top: 0, left: '-1.5px', width: '50%', height: '25px',
                backgroundColor: folder.color, borderTop: '1.5px solid #000', borderLeft: '1.5px solid #000', borderRight: '1.5px solid #000',
                borderRadius: '8px 8px 0 0', borderBottom: `2px solid ${folder.color}`, zIndex: 1
              }} />
              
              {/* Folder Body */}
              <div style={{
                width: '100%', height: '100%', backgroundColor: folder.color, borderRadius: '0 8px 8px 8px',
                border: '1.5px solid #000', position: 'relative', zIndex: 2,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}>
                <Heart size={16} fill="#EF4444" color="#000" style={{ position: 'absolute', top: '8px', right: '8px' }} />
                
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px' }}>
                  <button title="Editar" onClick={(e) => { e.stopPropagation(); openEditModal('folder', folder); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={14} color="#000" /></button>
                  <button title="Excluir" onClick={(e) => handleDelete('folder', folder.id, e)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={14} color="#000" /></button>
                </div>

                <div style={{ fontFamily: '"Outfit", sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#000', textAlign: 'center', marginTop: '10px' }}>{folder.name}</div>
                <div style={{ position: 'absolute', bottom: '15px', fontSize: '0.8rem', color: '#000', opacity: 0.7 }}>{folder.notebooks?.length || 0} items</div>
              </div>
            </div>
          </div>
        ))}

        {(filterView === 'everything' || filterView === 'notebooks') && sortedNotebooks.map(notebook => (
          <div key={notebook.id} onClick={() => navigate(`/reader/${notebook.id}`)} style={{ 
            width: '100%', height: '215px', cursor: 'pointer', position: 'relative'
          }}>
            {renderNotebookCover(notebook.coverColor, notebook.title)}
            
            <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px', zIndex: 10 }}>
              <button title="Editar Caderno" onClick={(e) => { e.stopPropagation(); openEditModal('notebook', notebook); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}><Edit2 size={14} color="#000" /></button>
              <button title="Excluir Caderno" onClick={(e) => handleDelete('notebook', notebook.id, e)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={14} color="#000" /></button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </>
  );
}
