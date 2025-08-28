# 🔐 Solução para Erro de Autenticação GitHub

## ❌ Problema Identificado
```
remote: Permission to AndersonB3/SISTEMA-HOSPITALAR.git denied to NutechAI.
fatal: unable to access 'https://github.com/AndersonB3/SISTEMA-HOSPITALAR.git/': The requested URL returned error: 403
```

**Causa**: O GitHub está usando credenciais cached de outro usuário (NutechAI) ao invés das suas.

## 🚀 Soluções (Execute na Ordem)

### Solução 1: Limpar Credenciais Cached (RECOMENDADO)

```bash
# Limpar credenciais do Windows Credential Manager
git config --global --unset credential.helper
git config --global credential.helper manager-core

# Tentar push novamente (vai solicitar novas credenciais)
git push -u origin main
```

### Solução 2: Personal Access Token (MAIS SEGURO)

1. **Criar Token no GitHub**:
   - Acesse: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Scope: ✅ `repo`, ✅ `workflow`
   - Copie o token gerado

2. **Usar Token como Senha**:
   ```bash
   git push -u origin main
   # Username: AndersonB3
   # Password: [cole o token aqui]
   ```

### Solução 3: Configurar URL com Token

```bash
# Remover remote atual
git remote remove origin

# Adicionar com token diretamente na URL
git remote add origin https://ghp_SEUTOKEN@github.com/AndersonB3/SISTEMA-HOSPITALAR.git

# Push sem solicitar credenciais
git push -u origin main
```

### Solução 4: GitHub CLI (Alternativa)

```bash
# Se tiver GitHub CLI instalado
gh auth login
gh repo create SISTEMA-HOSPITALAR --public --source=. --remote=origin --push
```

## 🔧 Comandos de Limpeza

```bash
# Limpar todas as credenciais Git
git config --global --unset-all credential.helper
git config --system --unset-all credential.helper

# Resetar configurações
git config --global credential.helper "manager-core"

# Verificar configuração
git config --global --list | findstr credential
```

## 📱 Verificação no Windows

1. **Abrir "Credential Manager"** (Gerenciador de Credenciais)
2. **Windows Credentials** → **Generic Credentials**
3. **Procurar por**: `git:https://github.com`
4. **Remover** todas as entradas relacionadas ao GitHub
5. **Tentar push novamente**

## ✅ Comando Final

Após executar uma das soluções acima:

```bash
git push -u origin main
```

## 🎯 Resultado Esperado

```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
Writing objects: 100% (XX/XX), done.
Total XX (delta 0), reused 0 (delta 0)
To https://github.com/AndersonB3/SISTEMA-HOSPITALAR.git
 * [new branch]      main -> main
```

---

**💡 Dica**: Se continuar com problemas, use a **Solução 2** (Personal Access Token) que é a mais confiável.
