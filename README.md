# Teacher Desk - by Search Bytes
---

# Projeto de Trabalho de Graduação - Sistema de Apoio ao Ensino

## Visão Geral

Este repositório contém o código-fonte e a documentação relacionados ao Projeto de Trabalho de Graduação (TG) intitulado "Sistema de Apoio ao Ensino". O objetivo deste projeto é desenvolver um software que ofereça ferramentas e recursos para auxiliar professores em suas atividades de ensino, promovendo uma experiência educacional mais interativa, colaborativa e eficaz.

## Funcionalidades Principais

O software desenvolvido neste projeto incluirá as seguintes funcionalidades principais:

- **Bibliografia:** Permite adicionar links de livros e sites para que os alunos possam acessar materiais de estudo recomendados.

- **Calendário:** Auxilia na organização e gerenciamento dos compromissos em sala de aula, permitindo planejar atividades e eventos importantes.

- **Diário de Plano de Aulas:** Oferece a possibilidade de criar e personalizar planos de aula, facilitando o planejamento das atividades docentes.

- **Enquetes:** Permite realizar votações em sala de aula, possibilitando que alunos participem ativamente das decisões em tempo real.

- **Modelos:** Disponibiliza modelos personalizados de planilhas e slides específicos para a Fatec, otimizando a criação de materiais.

- **Quizzes:** Facilita a criação de quizzes interativos para avaliar o conhecimento dos alunos de forma dinâmica e prática.

- **Relatórios:** Gera gráficos e relatórios detalhados sobre a participação e desempenho dos alunos, auxiliando na análise educacional.

- **Sorteador:** Permite sortear grupos, alunos ou números, auxiliando em atividades que requerem seleção aleatória.

- **Tutoriais:** Oferece tutoriais disponíveis na plataforma, ajudando professores e alunos a entender melhor as funcionalidades do software.

## Tecnologias Utilizadas

O projeto será desenvolvido utilizando as seguintes tecnologias:

- **Linguagem de Programação**: Typescript
- **Framework**: Node.js, Next.js, Prisma, Tailwind
- **Banco de Dados**: PostgreeSQL
- **Outras Tecnologias**: Add

## Guia de Configuração e Execução do Projeto

Este projeto utiliza **Next.js** com **TypeScript**, **Prisma** como ORM, e **PostgreSQL** como banco de dados.


### Passos para Configuração do Ambiente no Windows

### Instalar Node.js

Baixe e instale a versão LTS do Node.js:

https://nodejs.org/en

Verifique a instalação com:

```
node -v
npm -v
```

---

### Criar Projeto Next.js com TypeScript

Crie um novo projeto Next.js com o comando:

```
npx create-next-app@latest
```

Siga as instruções escolhendo as opções:

- **Typescript**: Yes  
- **ESLint**: Yes  
- **Tailwind CSS**: Yes  
- **Code inside \`/src\`**: Yes  
- **App Routes**: Yes  
- **Turbopack**: Yes  
- **Import Alias**: Yes  
- Pressione **Enter** para finalizar.

---

### Instalar Dependências

No diretório do projeto, execute:

```
npm install @prisma/client
npm install prisma --save-dev
npm install pg
```

Inicialize o Prisma:

```
npx prisma init
```

---

### Instalar PostgreSQL e pgAdmin

Baixe e instale o PostgreSQL e o pgAdmin:

https://www.postgresql.org/download/windows/

Durante a instalação, configure um usuário e senha para acessar o banco de dados.

---

### Configurar Banco de Dados no Projeto

1. **Criar Banco de Dados**:  
   No **pgAdmin**, crie um banco de dados chamado \`searchbytes\`.  
   
2. **Atualizar \`.env\`**:  
   Na raiz do projeto, crie ou edite o arquivo \`.env\` com suas credenciais:

   ```
   DATABASE_URL=\"postgresql://SeuUsuario:SuaSenha@localhost:5432/searchbytes\
    ```
3. **Inicializar Prisma** (caso não tenha sido feito antes):
    ```
   npx prisma init
    ```

---

###  Opcional: Configurar Prisma

Gere o cliente Prisma:

 ```
npx prisma generate
 ```
Crie a estrutura inicial do banco de dados com migrações:

 ```
npx prisma migrate dev --name init
 ```

---

### Configurar Tailwind CSS

O Tailwind CSS já foi incluído durante a criação do projeto com `create-next-app`, mas, caso precise configurá-lo manualmente, siga os passos abaixo:

1. **Instale o Tailwind CSS e suas dependências:**

   ```
   npm install -D tailwindcss postcss autoprefixer
   ```

2. **Inicialize o Tailwind CSS:**

    ```
    npx tailwindcss init -p
    ```
    Isso criará dois arquivos: tailwind.config.js e postcss.config.js.

3. **Configure os paths do Tailwind CSS:**
    No arquivo tailwind.config.js, ajuste o conteúdo para incluir os diretórios do projeto:

    ```
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

4. Inclua o Tailwind CSS nos estilos globais:
    No arquivo src/styles/globals.css, adicione as diretivas abaixo:
    ```
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```
### Iniciar o Projeto

Inicie o servidor de desenvolvimento:

 ```
npm run dev
 ```

Acesse o projeto em: http://localhost:3000

## Documentação Adicional

Para mais informações sobre o projeto, consulte a documentação completa disponível em [link para a documentação, se aplicável.

---
