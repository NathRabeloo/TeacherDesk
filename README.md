Aqui está o seu README alterado conforme solicitado:

---

# TeacherDesk - Sistema de Apoio ao Ensino

## Visão Geral

Este repositório contém o código-fonte e a documentação relacionados ao projeto de Trabalho de Graduação (TG) intitulado **TeacherDesk**. O principal objetivo deste projeto foi desenvolver uma aplicação web capaz de apoiar os professores em suas atividades de ensino, fornecendo ferramentas simples e acessíveis para facilitar a gestão de atividades pedagógicas. O **TeacherDesk** não se propõe a substituir plataformas oficiais de gestão escolar, mas sim complementar o trabalho docente, oferecendo praticidade e dinamismo no acompanhamento da aprendizagem.

Conforme aponta Stahl (1997, p. 292), “a importância da apropriação das novas tecnologias por todos está no fato de que ela permitirá uma atuação profissional efetiva dentro da cultura tecnológica atual — uma realidade que, hoje, ainda é acessível a poucos.”

## Justificativa

Este projeto visa contribuir para o desenvolvimento profissional dos docentes, especialmente aqueles com menor familiaridade técnica com ferramentas digitais. Além disso, busca favorecer o processo de ensino-aprendizagem, ao possibilitar o monitoramento contínuo do desempenho dos alunos e a criação de atividades interativas como quizzes, enquetes e sorteios.

## Funcionalidades Principais

O **TeacherDesk** oferece diversas funcionalidades que buscam simplificar e dinamizar as atividades pedagógicas:

* **Bibliografia**: Permite adicionar links de livros e sites, facilitando o acesso a materiais de estudo recomendados.

* **Calendário**: Auxilia no gerenciamento de compromissos, atividades e eventos importantes relacionados ao ensino.

* **Diário de Plano de Aulas**: Facilita a criação e personalização de planos de aula, proporcionando um planejamento eficiente.

* **Enquetes**: Realiza votações rápidas e interativas, permitindo que os alunos participem ativamente das decisões em sala de aula.

* **Modelos**: Disponibiliza modelos personalizados de planilhas e slides, otimizando a criação de materiais didáticos.

* **Quizzes**: Permite criar quizzes interativos para avaliar o conhecimento dos alunos de forma dinâmica.

* **Relatórios**: Gera relatórios detalhados sobre o desempenho e a participação dos alunos, ajudando no acompanhamento contínuo.

* **Sorteador**: Realiza sorteios de grupos, alunos ou números, auxiliando em atividades que requerem uma seleção aleatória.

* **Tutoriais**: Fornece tutoriais para auxiliar no uso do sistema, tanto para professores quanto para alunos.

## Tecnologias Utilizadas

O desenvolvimento do **TeacherDesk** utilizou as seguintes tecnologias amplamente adotadas no mercado:

<<<<<<< HEAD
* **Frontend**: React.js, Next.js
* **Backend**: Node.js
* **Banco de Dados**: Supabase
* **Hospedagem**: Vercel
* **Outras Tecnologias**: Aiven (nuvem gerenciada)

## Guia de Configuração e Execução do Projeto

Este projeto utiliza **Next.js** com **React** para o frontend, **Node.js** no backend, e **Supabase** como banco de dados.
=======
- **Linguagem de Programação**: Typescript
- **Framework**: Node.js, Next.js, Tailwind, Supabase
- **Banco de Dados**: PostgreeSQL
- **Outras Tecnologias**: Add

## Guia de Configuração e Execução do Projeto

Este projeto utiliza **Next.js** com **TypeScript**, **Supabase** como ORM, e **PostgreSQL** como banco de dados.

>>>>>>> f7a6461c479f9a9786834a45e09f91a2a568e148

### Passos para Configuração do Ambiente no Windows

#### Instalar Node.js

Baixe e instale a versão LTS do Node.js:

[Link para Node.js](https://nodejs.org/en)

Verifique a instalação com:

```
node -v
npm -v
```

#### Criar Projeto Next.js com TypeScript

Crie um novo projeto Next.js com o comando:

```
npx create-next-app@latest
```

Escolha as seguintes opções:

* **Typescript**: Yes
* **ESLint**: Yes
* **Tailwind CSS**: Yes
* **Code inside \`/src\`**: Yes
* **App Routes**: Yes
* **Turbopack**: Yes
* **Import Alias**: Yes

Pressione **Enter** para finalizar.

#### Instalar Dependências

<<<<<<< HEAD
No diretório do projeto, execute:

```
npm install @supabase/supabase-js
npm install prisma --save-dev
npm install pg
```

#### Configurar Banco de Dados no Projeto

1. **Criar Banco de Dados**:

   * No **Supabase**, crie um banco de dados para o projeto.

2. **Configurar `.env`**:
   Atualize o arquivo `.env` na raiz do projeto com suas credenciais:

   ```
   DATABASE_URL="postgresql://SeuUsuario:SuaSenha@localhost:5432/teacherdesk"
   ```

3. **Inicializar Prisma** (caso não tenha sido feito antes):

   ```
   npx prisma init
   ```

#### Instalar Tailwind CSS

O Tailwind CSS foi incluído durante a criação do projeto, mas, caso precise configurá-lo manualmente, siga os passos abaixo:

1. **Instale o Tailwind CSS e suas dependências**:
=======
### Configurar Tailwind CSS

O Tailwind CSS já foi incluído durante a criação do projeto com `create-next-app`, mas, caso precise configurá-lo manualmente, siga os passos abaixo:

1. **Instale o Tailwind CSS e suas dependências:**
>>>>>>> f7a6461c479f9a9786834a45e09f91a2a568e148

   ```
   npm install -D tailwindcss postcss autoprefixer
   ```

2. **Inicialize o Tailwind CSS**:

   ```
   npx tailwindcss init -p
   ```

3. **Configurar os paths do Tailwind CSS**:

   No arquivo `tailwind.config.js`, ajuste o conteúdo para incluir os diretórios do projeto:

   ```js
   /** @type {import('tailwindcss').Config} */
   module.exports = {
     content: [
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
         extend: {},
     },
     plugins: [],
   }
   ```

4. **Incluir o Tailwind CSS nos estilos globais**:

   No arquivo `src/styles/globals.css`, adicione as diretivas:

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

### Iniciar o Projeto

Inicie o servidor de desenvolvimento:

```
npm run dev
```

Acesse o projeto em: [teacherdesk.org]
