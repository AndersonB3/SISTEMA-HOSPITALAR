# 🔗 Integração PHP com Sistema Flask

## 📋 Visão Geral

A integração PHP foi adicionada ao Sistema Hospitalar Flask para expandir as funcionalidades com:
- **Dashboard avançado** com gráficos interativos
- **Sistema de relatórios** personalizados
- **APIs RESTful** para integrações externas
- **Business Intelligence** com análises preditivas

## 🏗️ Arquitetura da Integração

### **Sistema Híbrido**
```
┌─────────────────┐    ┌─────────────────┐
│   FLASK (Core)  │    │   PHP (Extra)   │
│                 │    │                 │
│ • Autenticação  │◄──►│ • Dashboard     │
│ • CRUD Pacientes│    │ • Relatórios    │
│ • Módulos Base  │    │ • Analytics     │
│ • SQLite DB     │    │ • APIs Extra    │
└─────────────────┘    └─────────────────┘
        │                       │
        └───────────────────────┘
              Mesmo Banco SQLite
```

### **Comunicação**
- **Banco de Dados**: Compartilhado (SQLite)
- **Sessões**: Integração via cookies/headers
- **APIs**: REST endpoints independentes
- **Interface**: Links entre sistemas

## 📁 Estrutura dos Arquivos PHP

```
php/
├── index.php              # Página principal dos módulos PHP
├── config/
│   └── database.php       # Configuração de banco (SQLite)
├── api/
│   └── hospital.php       # API REST para dados hospitalares
└── modules/
    └── dashboard.php      # Dashboard com gráficos interativos
```

## 🔧 Configuração e Instalação

### **1. Servidor Web (Escolha uma opção)**

#### **Opção A: XAMPP (Recomendado para Windows)**
1. **Baixar XAMPP**: https://www.apachefriends.org/
2. **Instalar** XAMPP em `C:\xampp`
3. **Configurar** document root para o projeto:
   ```apache
   # Em C:\xampp\apache\conf\httpd.conf
   DocumentRoot "C:\Users\Usuario\Desktop\SISTEMA HOSPITALAR"
   <Directory "C:\Users\Usuario\Desktop\SISTEMA HOSPITALAR">
       Options Indexes FollowSymLinks
       AllowOverride All
       Require all granted
   </Directory>
   ```

#### **Opção B: PHP Built-in Server**
```bash
# No diretório do projeto
cd "C:\Users\Usuario\Desktop\SISTEMA HOSPITALAR"
php -S localhost:8080
```

#### **Opção C: WAMP Server**
1. **Baixar WAMP**: http://www.wampserver.com/
2. **Instalar** e configurar virtual host
3. **Apontar** para o diretório do projeto

### **2. Verificar PHP**
```bash
# Verificar versão (mínimo PHP 7.4)
php --version

# Verificar extensões necessárias
php -m | grep -E "(pdo|sqlite)"
```

### **3. Configurar Permissões**
```bash
# Windows (PowerShell como Admin)
icacls "C:\Users\Usuario\Desktop\SISTEMA HOSPITALAR\instance" /grant Everyone:F

# Linux/Mac
chmod 755 instance/
chmod 666 instance/hospital.db
```

## 🚀 Como Usar

### **1. Acessar via Flask**
1. **Login** no sistema Flask: http://127.0.0.1:5000
2. **Navegar** para módulos
3. **Clicar** em "Módulos PHP" (disponível para admin/ti)

### **2. Acesso Direto PHP**
1. **Iniciar** servidor PHP: `php -S localhost:8080`
2. **Acessar**: http://localhost:8080/php/
3. **Dashboard**: http://localhost:8080/php/modules/dashboard.php

### **3. Usar APIs**
```javascript
// Buscar estatísticas
fetch('/php/api/hospital.php?endpoint=statistics')
  .then(response => response.json())
  .then(data => console.log(data));

// Buscar pacientes com filtros
fetch('/php/api/hospital.php?endpoint=search&convenio=sus&limite=10')
  .then(response => response.json())
  .then(data => console.log(data));
```

## 🔌 APIs Disponíveis

### **Base URL**: `/php/api/hospital.php`

#### **GET /php/api/hospital.php?endpoint=statistics**
Retorna estatísticas gerais do sistema:
```json
{
  "success": true,
  "data": {
    "total_pacientes": 150,
    "pacientes_hoje": 5,
    "pacientes_por_convenio": [...],
    "pacientes_por_idade": [...]
  }
}
```

#### **GET /php/api/hospital.php?endpoint=search**
Busca pacientes com filtros:
```
Parâmetros:
- nome: string
- convenio: string  
- cidade: string
- data_inicio: Y-m-d
- data_fim: Y-m-d
- limit: number (padrão: 50)
- offset: number (padrão: 0)
```

#### **GET /php/api/hospital.php?endpoint=report**
Gera relatórios:
```
Parâmetros:
- type: summary|detailed
```

## 🎨 Funcionalidades PHP

### **1. Dashboard Avançado**
- **Gráficos interativos** com Chart.js
- **Estatísticas em tempo real**
- **Análise de convênios** e faixas etárias
- **Interface moderna** com gradientes

### **2. APIs RESTful**
- **Endpoints** para estatísticas e busca
- **Suporte a CORS** para integração
- **Tratamento de erros** robusto
- **Formato JSON** padronizado

### **3. Banco de Dados Compartilhado**
- **Mesma base** SQLite do Flask
- **Transações seguras** com PDO
- **Pool de conexões** otimizado
- **Logs de erro** detalhados

## 🔒 Segurança

### **Implementações**
- **Prepared Statements** para SQL
- **Sanitização** de inputs
- **Headers CORS** configurados
- **Tratamento de exceções**

### **Recomendações**
- **Autenticação**: Integrar com sistema Flask
- **HTTPS**: Usar em produção
- **Rate Limiting**: Implementar para APIs
- **Logs**: Monitorar acessos

## 🐛 Troubleshooting

### **Erro: "Banco não encontrado"**
```bash
# Verificar caminho do banco
ls -la instance/hospital.db

# Verificar permissões
chmod 666 instance/hospital.db
```

### **Erro: "PDO SQLite não encontrado"**
```bash
# Instalar extensão PHP
# Ubuntu/Debian
sudo apt-get install php-sqlite3

# Windows (XAMPP já inclui)
# Verificar php.ini: extension=pdo_sqlite
```

### **Erro: "CORS Policy"**
```php
// Adicionar headers no início do arquivo API
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
```

## 📈 Roadmap

### **Próximas Funcionalidades**
- [ ] **Sistema de relatórios** em PDF
- [ ] **Integração com Firebase** para real-time
- [ ] **Machine Learning** para análises preditivas
- [ ] **Webhooks** para notificações
- [ ] **Cache Redis** para performance
- [ ] **Testes automatizados** PHPUnit

### **Integrações Futuras**
- [ ] **WordPress** para portal público
- [ ] **Laravel** para módulos complexos
- [ ] **Vue.js/React** para SPA
- [ ] **Docker** para containerização

## 💡 Benefícios da Integração

### **Técnicos**
- **Flexibilidade**: Diferentes linguagens para diferentes necessidades
- **Performance**: PHP para operações específicas
- **Escalabilidade**: Microserviços independentes
- **Manutenção**: Separação de responsabilidades

### **Funcionais**
- **Dashboard rico**: Gráficos e visualizações avançadas
- **Relatórios**: Geração dinâmica e personalizada
- **APIs**: Integração com sistemas externos
- **Extensibilidade**: Fácil adição de novos módulos

---

## 🤝 Suporte

Para dúvidas sobre a integração PHP:
1. **Verificar** este guia primeiro
2. **Consultar** logs de erro PHP
3. **Testar** APIs via Postman/curl
4. **Reportar** problemas com logs detalhados

**Desenvolvido para expandir as capacidades do Sistema Hospitalar** 🏥💻
