# Sistema de Notificações Padronizadas

## Visão Geral

O sistema hospitalar agora possui um sistema de notificações Toast padronizado e profissional que substitui os `alert()` básicos do navegador. Todas as notificações são exibidas de forma consistente e elegante em toda a aplicação.

## Implementação

### Arquivos Principais

1. **`/static/js/notifications.js`** - Sistema global de notificações Toast
2. **Templates atualizados** - Todas as páginas agora carregam o sistema de notificações

### Tipos de Notificação

#### 1. Sucesso (`showSuccess`)
```javascript
showSuccess('Título', 'Mensagem de sucesso', 3000);
```
- **Cor**: Verde
- **Ícone**: `fas fa-check-circle`
- **Uso**: Confirmações, operações bem-sucedidas
- **Duração padrão**: 3 segundos

#### 2. Erro (`showError`)
```javascript
showError('Título', 'Mensagem de erro', 5000);
```
- **Cor**: Vermelho
- **Ícone**: `fas fa-times-circle`
- **Uso**: Erros, falhas, validações
- **Duração padrão**: 5 segundos

#### 3. Aviso (`showWarning`)
```javascript
showWarning('Título', 'Mensagem de aviso', 4000);
```
- **Cor**: Amarelo/Laranja
- **Ícone**: `fas fa-exclamation-triangle`
- **Uso**: Alertas, campos obrigatórios, validações
- **Duração padrão**: 4 segundos

#### 4. Informação (`showInfo`)
```javascript
showInfo('Título', 'Mensagem informativa', 3000);
```
- **Cor**: Azul
- **Ícone**: `fas fa-info-circle`
- **Uso**: Informações gerais, status, processos
- **Duração padrão**: 3 segundos

### Recursos Avançados

#### Confirmação com Toast
```javascript
confirmarAcao('Deseja excluir este item?', function() {
    // Ação confirmada
    console.log('Item excluído');
}, 'Confirmação de Exclusão');
```

#### Toast Manual (Sem Auto-Remoção)
```javascript
showToast('warning', 'Título', 'Mensagem', 0); // 0 = não remove automaticamente
```

#### Suporte a HTML nas Mensagens
```javascript
showSuccess('Cadastro Realizado', 'Paciente <strong>João Silva</strong> foi cadastrado com sucesso!');
```

## Características Técnicas

### Design Responsivo
- **Desktop**: Toasts aparecem no canto superior direito
- **Mobile**: Toasts ocupam toda a largura da tela
- **Animações**: Entrada suave da direita, saída com fade

### Acessibilidade
- **Cores contrastantes** para facilitar leitura
- **Ícones descritivos** para identificação visual rápida
- **Botão de fechar** sempre visível
- **Auto-remoção** configúravel por tipo

### Performance
- **CSS puro** para animações (sem dependências)
- **Leve e rápido** - não impacta performance
- **Stackable** - múltiplos toasts podem ser exibidos simultaneamente

## Migração dos `alert()` Antigos

### Antes (Alert Simples)
```javascript
alert('Erro: Bootstrap não carregado. Recarregue a página.');
alert('✓ Cadastro realizado com sucesso!');
alert('Erro ao fazer logout. Por favor, tente novamente.');
```

### Depois (Toast Padronizado)
```javascript
showError('Erro de Sistema', 'Bootstrap não carregado. Recarregue a página.');
showSuccess('Cadastro Realizado', 'Paciente cadastrado com sucesso!');
showError('Erro de Logout', 'Erro ao fazer logout. Por favor, tente novamente.');
```

## Exemplos de Uso no Sistema

### 1. Cadastro de Paciente
```javascript
// Sucesso
showSuccess(
    'Cadastro Realizado', 
    `Paciente <strong>${dados.nome}</strong> foi cadastrado com sucesso!<br><strong>Prontuário:</strong> ${resultado.prontuario}`,
    5000
);

// Erro de validação
showError('Dados Incompletos', 'Por favor, preencha todos os campos obrigatórios: Nome e Data de Nascimento.');
```

### 2. Pesquisa de Pacientes
```javascript
// Carregando
showInfo('Buscando Pacientes', 'Realizando pesquisa no banco de dados de pacientes...');

// Resultado
showSuccess('Pesquisa Concluída', `Foram encontrados <strong>${resultados.length}</strong> paciente(s) correspondente(s) à sua busca.`);

// Sem resultados
showWarning('Nenhum Resultado', 'Nenhum paciente foi encontrado com os termos pesquisados.');
```

### 3. Movimentação de Pacientes
```javascript
// Sucesso na movimentação
showSuccess(
    'Movimentação Registrada', 
    `Nova movimentação de <strong>${tipo}</strong> foi registrada com sucesso para o paciente <strong>${nome}</strong>.`,
    4000
);

// Paciente não selecionado
showWarning('Paciente Obrigatório', 'É necessário selecionar um paciente na aba de cadastro antes de registrar uma movimentação.');
```

## Personalização

### Modificar Duração
```javascript
showSuccess('Título', 'Mensagem', 10000); // 10 segundos
showInfo('Título', 'Mensagem', 1000);     // 1 segundo
```

### Toasts Permanentes
```javascript
showError('Erro Crítico', 'Sistema indisponível', 0); // Não remove automaticamente
```

### Adicionando Ações nos Toasts
```javascript
const toast = showInfo('Download', `
    Arquivo preparado para download
    <div style="margin-top: 10px;">
        <button onclick="baixarArquivo()" class="btn btn-sm btn-primary">
            <i class="fas fa-download"></i> Baixar
        </button>
    </div>
`, 0);
```

## Benefícios da Padronização

1. **Consistência Visual**: Todas as notificações seguem o mesmo padrão
2. **Melhor UX**: Toasts são menos intrusivos que alerts
3. **Informações Ricas**: Suporte a HTML, ícones e formatação
4. **Acessibilidade**: Melhor contraste e usabilidade
5. **Profissional**: Visual moderno e elegante
6. **Manutenibilidade**: Código mais limpo e organizado

## Troubleshooting

### Toasts não aparecem
1. Verificar se `notifications.js` está carregado
2. Verificar console do navegador para erros
3. Confirmar que as funções estão disponíveis globalmente

### Estilos incorretos
1. Verificar se não há conflitos de CSS
2. O arquivo `notifications.js` injeta os estilos automaticamente
3. Verificar se FontAwesome está carregado para os ícones

### Performance
- Os toasts são removidos automaticamente do DOM
- Não há acúmulo de elementos na memória
- Animações CSS são otimizadas para performance
