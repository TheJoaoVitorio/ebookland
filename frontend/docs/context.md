# Contexto e Documentação - Ebooklandia (Frontend)

## 🎯 Objetivo do Projeto
O Ebooklandia (originalmente inspirado no Superrbook) é uma plataforma educacional e de anotações interativas de alto padrão (Premium). O objetivo principal da interface do usuário é transmitir a sensação tátil e hiper-realista de um dispositivo real (Design Skeuomorphic), simulando um "iPad" dentro do navegador. 

## 🧱 Arquitetura e Estrutura
- **Tecnologias:** React 18, TypeScript, Vite.
- **Roteamento:** `react-router-dom` para navegação entre Landing Page, Biblioteca e Leitor.
- **Ícones:** `lucide-react` para uso de SVGs vetoriais profissionais, abandonando emojis tradicionais em prol de um design mais limpo e maduro.
- **Flipbook Engine:** Utilização de `react-pageflip` (com `HTMLFlipBook`) para criar o efeito físico de páginas virtuais sendo viradas em 3D, essencial para a imersão na área de "Leitura/Escrita".

## 🎨 Design Skeuomorphic e Componentes
- **Layout Global (`SkeuomorphicLayout`):** Um wrapper global estilizado com CSS que envelopa as views `/workspace` e `/reader` dentro de um mockup de iPad de couro (com lápis amarelo e chanfros de relevo).
- **Home/Landing Page:** Isolada do design de iPad, desenhada puramente com tipografias modernas, espaçamentos largos e focada em conversão e usabilidade rápida.
- **Workspace:** Interface interativa e flutuante de criação de cadernos (com "gavetas" de opções 3D e seletor de cores vivas).

## 🛠 Próximos Passos
- Expandir as ferramentas laterais do Reader (Borracha, Marca-texto, cores de fonte).
- Melhorar a capacidade do usuário organizar cadernos em pastas arrastando e soltando (Drag & Drop).
