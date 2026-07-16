# Status das Tarefas do Projeto Ebooklandia

## Frontend
- [x] Criação do projeto React (Vite, TypeScript, SWC).
- [x] Configuração de roteamento (React Router DOM).
- [x] Design Global Skeuomorphic (iPad base com capa de couro, tela bezel e lápis).
- [x] Implementação da Landing Page (`Home.tsx`) seguindo a tipografia "Caveat/Inter" e inspiração na plataforma Superrbook.
- [x] Componentização da Barra de Ferramentas e UI Lateral.
- [x] Implementação da Biblioteca (`Workspace.tsx`) com interface 3D de seleção de cor.
- [x] Refatoração visual de Emojis para SVGs nativos com `lucide-react`.
- [x] Funcionalidade de Flipbook no leitor de cadernos (`react-pageflip`).
- [x] Lógica de paginação automática (quebra de página ao exceder limite de linhas).
- [ ] Melhorias futuras de UI (transições de rotas e animações).
- [ ] Salvamento em tempo real (debounce) de textos.

## Backend
- [x] Configuração inicial (Express, TypeScript).
- [x] Integração com Banco de Dados SQLite local.
- [x] Refatoração da arquitetura limpa (MVC).
  - [x] `controllers/`
  - [x] `routes/`
  - [x] `services/`
- [x] Esquema do Prisma (`User`, `Notebook`, `NotebookPage`, `Folder`).
- [x] Downgrade para Prisma v5 para maior estabilidade no Windows (sem dependência de LibSQL adapter externo).
- [x] API Completa de Workspace e Cadernos:
  - `GET /api/workspace`: Retorna pastas e cadernos avulsos.
  - `POST /api/folders`: Cria nova pasta de organização.
  - `POST /api/notebooks`: Cria novo caderno (com título e cor personalizados).
  - `GET /api/notebooks/:id/pages`: Traz todas as páginas de um caderno específico.
  - `POST /api/notebooks/:id/pages`: Atualiza o texto/conteúdo de uma página de um caderno.
- [ ] Implementação de autenticação (JWT / Usuários).
