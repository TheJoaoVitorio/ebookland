import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "login_btn": "Sign in with Google",
      "hero_grownups": "Dear friends,",
      "hero_meet": "meet",
      "hero_ebooklandia": "ebookland",
      "hero_description1": "The digital notebook that",
      "hero_actually": "actually!",
      "hero_description2": "gives you total freedom.",
      "hero_cta": "I want to see it! yay!!!",
      "hero_badge_name": "Name",
      "hero_badge_class": "Class",
      
      "canvas_click": "Click anywhere",
      "canvas_drag": "And drag freely!",
      "canvas_like": "(Like on a whiteboard)",
      
      "card1_title": "Feel like you're on a",
      "card1_highlight": "whiteboard",
      "card1_item1": "No restrictive lines",
      "card1_item2": "Create boxes wherever you want",
      "card1_item3": "Drag freely",
      "card1_item4": "Organize your ideas",
      
      "fonts_collection": "A collection of calligraphy.",
      "fonts_express": "To express your personality...",
      "fonts_vibe": "Without losing the paper vibe.",
      
      "card2_title": "Your handwriting,",
      "card2_highlight": "your way",
      "card2_item1": "Real paper feel",
      "card2_item2": "Google Fonts typography",
      "card2_item3": "Caveat, Kalam and more",
      "card2_item4": "Change in the floating menu",
      
      "save_relax": "Relax...",
      "save_saved": "It's all saved.",
      "save_clouds": "In the clouds! ☁️",
      
      "card3_title": "Automatic",
      "card3_highlight": "protection",
      "card3_item1": "Forget the save button",
      "card3_item2": "Real-time synchronization",
      "card3_item3": "Your notebooks in the cloud",
      "card3_item4": "End-to-end data encryption",
      
      "save_cta": "Start writing now",

      "workspace_loading": "Loading library...",
      "workspace_confirm_delete_notebook": "Are you sure you want to delete this notebook?",
      "workspace_confirm_delete_folder": "Are you sure you want to delete this folder?",
      "workspace_placeholder_name": "Scribble a name",
      "workspace_new": "New",
      "workspace_edit": "Edit",
      "workspace_notebook": "Notebook",
      "workspace_folder": "Folder",
      "workspace_create": "Create",
      "workspace_save": "Save",
      "workspace_my_notes": "Notes",
      "workspace_library": "Library",
      "workspace_everything": "Everything",
      "workspace_notebooks": "Notebooks",
      "workspace_folders": "Folders",
      "workspace_last_modified": "Last Modified",
      "workspace_alphabetically": "Alphabetically",
      "workspace_items": "items",

      "reader_page_template": "Page Template",
      "reader_page": "Page",
      "reader_loading": "Loading notebook...",
      "template_Blank": "Blank",
      "template_Wide_Ruled": "Wide Ruled",
      "template_Thin_Ruled": "Thin Ruled",
      "template_Dotted_Ruled": "Dotted Ruled",
      "template_Dotted": "Dotted",
      "template_Reticle_Grid": "Reticle Grid",
      "template_Checks": "Checks",
      "template_Dashed_Checks": "Dashed Checks"
    }
  },
  pt: {
    translation: {
      "login_btn": "Entrar com Google",
      "hero_grownups": "Queridos amigos,",
      "hero_meet": "conheça o",
      "hero_ebooklandia": "ebookland",
      "hero_description1": "O caderno digital que",
      "hero_actually": "actually!",
      "hero_description2": "te dá liberdade total.",
      "hero_cta": "Quero conhecer! uipii!!!",
      "hero_badge_name": "Nome",
      "hero_badge_class": "Turma",
      
      "canvas_click": "Clique em qualquer lugar",
      "canvas_drag": "E arraste livremente!",
      "canvas_like": "(Igual num quadro branco)",
      
      "card1_title": "Sinta-se num",
      "card1_highlight": "quadro branco",
      "card1_item1": "Sem linhas restritivas",
      "card1_item2": "Crie caixas onde quiser",
      "card1_item3": "Arraste livremente",
      "card1_item4": "Organize suas ideias",
      
      "fonts_collection": "Uma coleção de caligrafias.",
      "fonts_express": "Para você expressar sua personalidade...",
      "fonts_vibe": "Sem perder a vibe do papel.",
      
      "card2_title": "A sua letra,",
      "card2_highlight": "do seu jeito",
      "card2_item1": "Sensação de papel real",
      "card2_item2": "Tipografias do Google Fonts",
      "card2_item3": "Caveat, Kalam e muito mais",
      "card2_item4": "Troque no menu flutuante",
      
      "save_relax": "Relaxa...",
      "save_saved": "Tá tudo salvo.",
      "save_clouds": "Nas nuvens! ☁️",
      
      "card3_title": "Proteção",
      "card3_highlight": "automática",
      "card3_item1": "Esqueça o botão de salvar",
      "card3_item2": "Sincronização em tempo real",
      "card3_item3": "Seus cadernos na nuvem",
      "card3_item4": "Criptografia de dados de ponta",
      
      "save_cta": "Comece a escrever agora",

      "workspace_loading": "Carregando biblioteca...",
      "workspace_confirm_delete_notebook": "Tem certeza que deseja excluir este caderno?",
      "workspace_confirm_delete_folder": "Tem certeza que deseja excluir esta pasta?",
      "workspace_placeholder_name": "Escreva um nome",
      "workspace_new": "Novo",
      "workspace_edit": "Editar",
      "workspace_notebook": "Caderno",
      "workspace_folder": "Pasta",
      "workspace_create": "Criar",
      "workspace_save": "Salvar",
      "workspace_my_notes": "Notas",
      "workspace_library": "Biblioteca",
      "workspace_everything": "Tudo",
      "workspace_notebooks": "Cadernos",
      "workspace_folders": "Pastas",
      "workspace_last_modified": "Última Modificação",
      "workspace_alphabetically": "Alfabeticamente",
      "workspace_items": "itens",

      "reader_page_template": "Modelo de Página",
      "reader_page": "Página",
      "reader_loading": "Carregando caderno...",
      "template_Blank": "Em Branco",
      "template_Wide_Ruled": "Pauta Larga",
      "template_Thin_Ruled": "Pauta Fina",
      "template_Dotted_Ruled": "Pauta Pontilhada",
      "template_Dotted": "Pontilhado",
      "template_Reticle_Grid": "Reticulado",
      "template_Checks": "Quadriculado",
      "template_Dashed_Checks": "Quadriculado Tracejado"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    // Language detection options
    detection: {
      order: ['navigator'], // Detect from browser language
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
