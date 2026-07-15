# Contexto e Documentação - Ebooklandia (Backend)

## 🎯 Objetivo do Projeto
Fornecer a API robusta e o banco de dados que alimentam toda a interface do projeto Ebooklandia. O foco deste backend é ser rápido, localmente testável e modular, escalando para gerenciar desde "Páginas", "Cadernos" e "Pastas", até, no futuro, "Usuários" e "Sincronização em Nuvem".

## 🧱 Arquitetura (MVC e Clean Architecture)
A arquitetura do servidor Node.js foi refatorada para seguir separação clara de responsabilidades:
- **`routes/`:** Definições das rotas HTTP do Express e endpoints (ex: `notebook.routes.ts`).
- **`controllers/`:** Camada de interceptação HTTP. Captura `req` e `res`, faz tratamento de exceções (try/catch), lida com status de erro (500, 200) e repassa os dados.
- **`services/`:** Camada de regras de negócios. É a única camada que se comunica diretamente com o Prisma ORM e toma as decisões (ex: `createNotebook()`, `getWorkspaceData()`).

## 🗄 Prisma e Banco de Dados (SQLite)
O backend usa o Prisma ORM (`@prisma/client` v5.14.0) acoplado a um banco de dados **SQLite local (`dev.db`)**.
*Nota Histórica:* Inicialmente foi testada a versão Prisma v7 em conjunto com adaptadores LibSQL, no entanto, para evitar problemas de compilação em ambiente Windows e problemas de `undefined` na inicialização do driver, o projeto fez um "downgrade consciente" para a v5, o que solidificou e resolveu qualquer quebra do Prisma Engine de forma nativa.

## 🗂 Modelagem de Dados Atuais (`schema.prisma`)
- `Folder` (Pastas para agrupar cadernos).
- `Notebook` (O caderno em si, contendo uma cor de capa e um título customizado).
- `NotebookPage` (Representação atômica de uma folha do caderno com o seu respectivo texto digitado).
- `User` e `ReadingProgress` (Modelos preparados para escalabilidade futura com Autenticação e acompanhamento de leitura).
