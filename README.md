# 🧵 Josi Artes e Bordados

Site vitrine do **Ateliê da Josi**, com bordados feitos à mão, cadernos personalizados, canecas e outros presentes. O cliente monta a lista de produtos que quer e envia o pedido pronto pelo **WhatsApp**. A Josi tem um painel próprio para cadastrar, editar e remover produtos.

🔗 **Site:** [josiartesebordados.com.br](https://josiartesebordados.com.br)
📸 **Instagram:** [@josiartesanato81](https://instagram.com/josiartesanato81)

---

## ✨ Funcionalidades

### Para os clientes
- **Catálogo de produtos** com foto, descrição e preço
- **Filtro por categoria:** Bordados, Cadernos, Canecas e Outros
- **Lista de pedido:** o cliente seleciona os produtos e clica para enviar
- **Pedido pelo WhatsApp:** a mensagem já sai pronta, com os itens e o valor total
- **Política de Privacidade**
- **Layout responsivo**, que funciona bem no celular

### Para a Josi (área administrativa)
- Acesso protegido por senha
- **Cadastrar, editar e excluir** produtos
- Envio de foto pelo celular/computador ou por link (URL)
- Busca de produtos por nome ou categoria
- ✨ **Descrição com IA:** gera um texto de venda para o produto usando o Google Gemini

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| [React 18](https://react.dev/) | Interface |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem |
| [Vite](https://vitejs.dev/) | Build e servidor de desenvolvimento |
| [Tailwind CSS](https://tailwindcss.com/) | Estilização |
| [Google Gemini API](https://ai.google.dev/) | Geração de descrições |
| [Vercel](https://vercel.com/) | Hospedagem |

---

## 📁 Estrutura do projeto

```
├── components/
│   ├── AdminPanel.tsx      # Painel de gerenciamento de produtos
│   ├── Storefront.tsx      # Vitrine/catálogo para os clientes
│   ├── ProductCard.tsx     # Card de cada produto
│   ├── PrivacyPolicy.tsx   # Página de política de privacidade
│   └── Icons.tsx           # Ícones SVG
├── services/
│   └── geminiService.ts    # Integração com a IA (Google Gemini)
├── App.tsx                 # Componente principal, navegação e login
├── constants.ts            # Produtos iniciais e número do WhatsApp
├── types.ts                # Tipos e categorias
└── index.html              # HTML base, SEO e Open Graph
```

---

## 🚀 Como rodar localmente

**Pré-requisito:** [Node.js](https://nodejs.org/) 18 ou superior

```bash
# 1. Clone o repositório
git clone https://github.com/matthaus200/Artes-e-Bordados-Josi.git
cd Artes-e-Bordados-Josi

# 2. Instale as dependências
npm install

# 3. Rode em modo de desenvolvimento
npm run dev
```

Depois é só abrir `http://localhost:5173` no navegador.

### Outros comandos

```bash
npm run build     # Gera a versão de produção na pasta /dist
npm run preview   # Abre localmente a versão de produção
```

---

## ⚙️ Configuração

| O quê | Onde alterar |
|---|---|
| Número do WhatsApp | `WHATSAPP_NUMBER` em `constants.ts` |
| Produtos iniciais | `INITIAL_PRODUCTS` em `constants.ts` |
| Categorias | `enum Category` em `types.ts` |
| Chave da IA (Gemini) | Variável de ambiente `API_KEY` |

---

## ☁️ Deploy na Vercel

1. Crie uma conta em [vercel.com](https://vercel.com/signup) usando o GitHub
2. Clique em **Add New → Project** e importe este repositório
3. A Vercel detecta sozinha que é um projeto **Vite**
4. (Opcional) Em **Environment Variables**, adicione a `API_KEY` do Gemini
5. Clique em **Deploy** 🎉

A cada `git push` na branch principal, o site é atualizado automaticamente.

---

## 👨‍💻 Autores

Desenvolvido por **Matthaus de Paula**,**Rafaela Gusczak**, **João Gabriel Nasario**, **Nicolas Rodrigues**, estudantes de Engenharia de Software na **Univille** (Joinville/SC)
