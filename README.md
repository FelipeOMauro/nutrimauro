# 🍏 Nutri Mauro - Sistema de Gestão para Nutricionistas

O **Nutri Mauro** é um ecossistema completo desenvolvido para nutricionistas que buscam excelência no acompanhamento de seus pacientes. O sistema combina uma interface moderna e intuitiva com ferramentas poderosas de análise clínica, permitindo o registro detalhado de evoluções, hábitos e dados antropométricos.

---

## 🚀 Funcionalidades Principais

- **🔒 Autenticação Segura**: Sistema de login e cadastro exclusivo para nutricionistas utilizando Supabase Auth.
- **📋 Gestão de Pacientes**: 
  - Listagem inteligente com busca em tempo real.
  - Cadastro detalhado em 3 etapas: **Pessoal**, **Clínico** e **Hábitos**.
  - Automações como cálculo de idade e IMC em tempo real.
- **📈 Perfil Clínico Completo**:
  - Prontuário editável com histórico de hábitos e condições de saúde.
  - **Gráfico de Evolução**: Visualização dinâmica da variação de peso ao longo do tempo (Recharts).
  - Histórico de consultas cronológico com medidas corporais.
- **📱 Design Premium**: Interface responsiva, com estética moderna em tons de verde, seguindo as melhores práticas de UX/UI.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as tecnologias mais modernas do mercado para garantir performance e escalabilidade:

- **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Ferramenta de Build**: [Vite](https://vitejs.dev/)
- **Banco de Dados e Auth**: [Supabase](https://supabase.com/) (PostgreSQL com Row Level Security)
- **Estilização**: CSS Vanilla (Design System Customizado)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Deploy**: [Vercel](https://vercel.com/)

---

## 🏗️ Processo de Desenvolvimento

O desenvolvimento seguiu uma metodologia ágil e focada em segurança:

1.  **Arquitetura**: O projeto foi estruturado como uma SPA (Single Page Application) com roteamento protegido, garantindo que apenas usuários autenticados acessem os dados dos pacientes.
2.  **Segurança de Dados**: Implementação rigorosa de **RLS (Row Level Security)** no banco de dados, assegurando que cada nutricionista tenha acesso exclusivo apenas aos seus próprios registros.
3.  **Variáveis de Ambiente**: Configuração de variáveis sensíveis via `.env`, mantendo chaves de API protegidas e fora do versionamento público.
4.  **Otimização para Produção**: Ajustes finos de build e configuração de roteamento na Vercel (`vercel.json`) para evitar erros de navegação.

---

## ⚙️ Como Executar o Projeto Localmente

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/FelipeOMauro/nutrimauro.git
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Configurar Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto seguindo o modelo do `.env.example`:
   ```env
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_key_aqui
   ```

4. **Rodar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

---

## 📄 Licença

Este projeto foi desenvolvido para o ecossistema **Nutri Mauro**. Todos os direitos reservados.

---
*Desenvolvido com ❤️ para elevar o nível da nutrição clínica.*
