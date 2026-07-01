# Clone do Trello - Estudo de IA Full-Stack

Este projeto é um **estudo experimental** focado em testar a capacidade de uma Inteligência Artificial em atuar como um desenvolvedor full-stack sênior. O objetivo principal foi validar até onde a IA consegue arquitetar, estruturar, estilizar e depurar uma aplicação complexa a partir de instruções sequenciais.

## 🚀 Sobre o Projeto
O sistema é um clone funcional de um gerenciador de tarefas (estilo Trello), desenvolvido com uma stack moderna focada em performance e facilidade de manutenção. 

### Stack Utilizada
- **Framework:** Next.js (React)
- **Estilização:** Tailwind CSS (Design System inspirado na Apple)
- **Banco de Dados:** SQLite (com Prisma ORM)
- **Funcionalidades:** Drag and Drop (dnd-kit), Temas (Dark/Light Mode), Autenticação local, Upload de arquivos local e Markdown.

---

## 🤖 Prompts Utilizados
O desenvolvimento seguiu uma metodologia de 5 prompts + ajustes de depuração:

1. **Estrutura & DB:** "Atue como um desenvolvedor full-stack sênior. Inicie um projeto usando Next.js, Tailwind CSS e Prisma com SQLite..."
2. **Layout:** "Construa a interface principal... inspirada no design system da Apple... colunas infinitas com scroll horizontal."
3. **Funcionalidades:** "Integre 'dnd-kit' para arrastar e soltar, Server Actions e estado de conclusão de cartões."
4. **Detalhes:** "Crie modal para etiquetas, descrição em Markdown (react-markdown) e comentários."
5. **Polimento:** "Implemente `next-themes` para modo escuro, exclusão de projetos/contas com confirmação e upload de imagens local."

---

## 🛠️ Como Testar o Projeto

Para rodar este projeto na sua máquina, siga os passos abaixo:

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado.
- Git instalado.

### Passo a passo
1. **Clone o repositório:**
   ```bash
   git clone [link-do-seu-repositorio]
   cd [nome-da-pasta]