# 🏥 Sistema Hospitalar

Sistema completo de gestão hospitalar desenvolvido em Flask com interface web moderna e funcionalidades específicas para diferentes módulos hospitalares.

## 📋 Funcionalidades

### ✅ Módulos Implementados
- **👥 Recepção**: Cadastro, busca e edição de pacientes
- **🚨 Classificação de Risco**: (Em desenvolvimento)
- **👨‍⚕️ Clínico Geral**: (Em desenvolvimento)
- **👩‍⚕️ Enfermagem**: (Em desenvolvimento)
- **💊 Farmácia**: (Em desenvolvimento)

### 🔐 Sistema de Autenticação
- Login com usuário e senha
- Autenticação de dois fatores (2FA)
- Controle de tentativas de login
- Bloqueio temporário por segurança
- Gestão de sessões

### 📊 Gestão de Pacientes
- Cadastro completo de pacientes
- Busca por nome, CPF ou prontuário
- Edição de dados existentes
- Validação de CPF
- Consulta automática de CEP
- Impressão de etiquetas

## 🛠️ Tecnologias Utilizadas

### Backend
- **Flask 3.0.0**: Framework web principal
- **SQLAlchemy**: ORM para banco de dados
- **SQLite**: Banco de dados local
- **Flask-Login**: Gestão de autenticação
- **Flask-WTF**: Proteção CSRF
- **Flask-Bcrypt**: Hash de senhas
- **Flask-Limiter**: Rate limiting

### Frontend
- **HTML5/CSS3**: Interface responsiva
- **JavaScript ES6+**: Funcionalidades interativas
- **Bootstrap Icons**: Ícones modernos
- **Font Awesome**: Ícones adicionais

### Segurança
- Proteção CSRF
- Hash bcrypt para senhas
- Rate limiting para APIs
- Validação de entrada
- Logs de auditoria

## 🚀 Instalação e Execução

### Pré-requisitos
- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)

### Configuração
1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd "SISTEMA HOSPITALAR"
   ```

2. **Crie um ambiente virtual**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # ou
   source .venv/bin/activate  # Linux/Mac
   ```

3. **Instale as dependências**
   ```bash
   pip install -r requirements.txt
   ```

4. **Execute o sistema**
   ```bash
   python app.py
   ```

5. **Acesse o sistema**
   - URL: http://127.0.0.1:5000
   - Usuário padrão: `admin`
   - Senha padrão: `admin123`

## 📁 Estrutura do Projeto

```
SISTEMA HOSPITALAR/
├── app.py                 # Aplicação principal Flask
├── requirements.txt       # Dependências Python
├── README.md             # Documentação
├── .gitignore           # Arquivos ignorados pelo Git
├── database/            # Modelos de banco de dados
│   ├── __init__.py
│   └── models.py
├── static/              # Arquivos estáticos
│   ├── css/            # Estilos CSS
│   └── js/             # Scripts JavaScript
├── templates/           # Templates HTML
│   ├── index.html      # Página de login
│   ├── modulos.html    # Dashboard principal
│   └── modulos/        # Templates dos módulos
├── logs/               # Logs do sistema
└── instance/           # Banco de dados SQLite
```

## 🔧 Configuração de Segurança

### Usuário Administrador
- **Usuário**: admin
- **Senha**: admin123 (⚠️ Altere após primeira instalação)

### Configurações de Sessão
- Tempo de sessão: 30 minutos
- Cookies HTTPOnly e Secure
- Proteção CSRF habilitada

### Rate Limiting
- 200 requisições por dia
- 50 requisições por hora
- 5 tentativas de login por minuto

## 📊 Módulos do Sistema

### 1. Recepção
- ✅ Cadastro de novos pacientes
- ✅ Busca de pacientes existentes
- ✅ Edição de dados cadastrais
- ✅ Validação de CPF
- ✅ Consulta automática de CEP
- ✅ Impressão de etiquetas

### 2. Módulos em Desenvolvimento
- 🔄 Classificação de Risco
- 🔄 Atendimento Médico
- 🔄 Enfermagem
- 🔄 Farmácia
- 🔄 Laboratório
- 🔄 Outras especialidades

## 🐛 Resolução de Problemas

### ✅ Problemas Resolvidos (v1.0.2)
- **"Não foi possível carregar os dados do paciente"**: Corrigido problema de autenticação e credenciais
- **Dados de convênio não carregando**: Corrigido mapeamento de dados da API
- **Dados de endereço não exibindo**: Corrigido relacionamentos de banco de dados
- **Notificações de erro falsas**: Melhorado tratamento de erros e validações
- **hideSearchResults is not defined**: Adicionada função ausente no sistema de busca
- **Design dos formulários**: Modernizado visual com gradientes, ícones e animações
- **Mensagens de CPF duplicadas**: Corrigido exibição de mensagens de validação
- **Modo de visualização de pacientes**: Implementado modo somente leitura ao buscar pacientes
- **Botão de editar**: Adicionado botão para habilitar edição dos dados do paciente
- **clearAndEnableForm is not defined**: Corrigida função ausente que causava erro ao salvar edições

### 🔧 Erros Comuns

#### Erro de Conexão com Banco
- **Causa**: Banco não inicializado
- **Solução**: Reiniciar a aplicação para criar as tabelas automaticamente

#### Erro de Permissão
- **Causa**: Usuário sem permissão para o módulo
- **Solução**: Verificar tipo de usuário e permissões

#### Campos não preenchendo automaticamente
- **Causa**: JavaScript desabilitado ou erro de rede
- **Solução**: Verificar console do navegador e conexão com internet

## 📝 Logs e Auditoria

O sistema gera logs automáticos em:
- `logs/hospital.log`: Logs gerais da aplicação
- Banco de dados: Tabela `log_auditoria` para ações dos usuários

## 🔒 Segurança

### Práticas Implementadas
- Hash bcrypt para senhas
- Proteção contra timing attacks
- Validação de entrada
- Rate limiting
- Logs de auditoria
- Proteção CSRF
- Cookies seguros

### Recomendações de Produção
1. Alterar senha padrão do admin
2. Configurar HTTPS
3. Usar banco de dados externo (PostgreSQL/MySQL)
4. Configurar backup automático
5. Implementar monitoramento

## 📈 Próximas Funcionalidades

- [ ] Sistema de relatórios
- [ ] Integração com convênios
- [ ] Sistema de agendamento
- [ ] Prontuário eletrônico
- [ ] Sistema de estoque
- [ ] Dashboard analítico
- [ ] API REST completa
- [ ] Aplicativo mobile

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua funcionalidade
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença privada. Todos os direitos reservados.

## ✨ Versão Atual

**v1.0.2** - Sistema com interface moderna e melhorias visuais
- ✅ Módulo de recepção totalmente funcional
- ✅ Busca de pacientes com dados completos
- ✅ Sistema de notificações otimizado
- ✅ Interface moderna com design atualizado
- ✅ Formulários com visual profissional
- ✅ Validações e tratamento de erros melhorados

### 🔄 Changelog v1.0.2
- **Melhorado**: Design moderno dos formulários com gradientes e animações
- **Adicionado**: Ícones específicos para cada seção (Informações Básicas, Convênio, Endereço)
- **Melhorado**: Inputs com bordas arredondadas e efeitos de hover/focus
- **Adicionado**: Checkboxes personalizados com estilo moderno
- **Melhorado**: Botões com efeitos visuais e responsividade
- **Adicionado**: Animações sutis para melhor experiência do usuário
- **Corrigido**: Validação de CPF não exibindo mensagens duplicadas
- **Implementado**: Modo de visualização somente leitura ao buscar pacientes
- **Adicionado**: Botão "Editar" para habilitar edição dos dados do paciente
- **Melhorado**: Interface com indicadores visuais claros de modo visualização/edição
- **Corrigido**: Função clearAndEnableForm ausente que causava erro ao salvar edições
- **Melhorado**: Sistema de atualização de pacientes com validação robusta no backend

### 🔄 Changelog v1.0.1
- **Corrigido**: Carregamento de dados de convênio e endereço
- **Corrigido**: Sistema de autenticação de requisições API
- **Corrigido**: Notificações de erro desnecessárias
- **Adicionado**: Função hideSearchResults ausente
- **Melhorado**: Logs detalhados para debugging
- **Melhorado**: Tratamento de erros específicos

---

*Desenvolvido para gestão hospitalar eficiente e segura* 🏥
