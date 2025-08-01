# Configuração para Produção - Sistema de Monitoramento Vivo

## Visão Geral

Este sistema permite consultar informações de monitoramento em múltiplas ferramentas (Zabbix, Elasticsearch e Dynatrace) através de uma interface web unificada.

## Pré-requisitos

### Ferramentas de Monitoramento

#### 1. Zabbix
- Versão: 5.0 ou superior
- API habilitada
- Token de autenticação configurado
- Permissões necessárias:
  - Leitura de hosts
  - Leitura de triggers
  - Leitura de templates
  - Leitura de host groups

#### 2. Elasticsearch
- Versão: 7.0 ou superior
- Índices configurados para:
  - Infraestrutura: logs com campos `host.name` e `host.hostname`
  - APM: logs com campo `labels.domain`
- Autenticação habilitada (opcional)

#### 3. Dynatrace
- API Token com permissões:
  - `entities.read`
  - `problems.read`
- Endpoint de API v2 disponível

## Configuração das APIs

### Problemas Comuns de CORS

**IMPORTANTE**: A aplicação faz chamadas diretas do browser para as APIs. Isso pode gerar erros de CORS (Cross-Origin Resource Sharing). 

**Soluções:**
1. **Configure CORS no servidor** (recomendado)
2. **Use um proxy reverso** (nginx, apache)
3. **Desabilite CORS no browser** (apenas para desenvolvimento)

### Zabbix

1. **Obter Token de Autenticação:**
```bash
curl -X POST \
  https://seu-zabbix.com/api_jsonrpc.php \
  -H 'Content-Type: application/json' \
  -d '{
    "jsonrpc": "2.0",
    "method": "user.login",
    "params": {
        "user": "admin",
        "password": "senha"
    },
    "id": 1
}'
```

2. **Configurações necessárias:**
- URL: `https://seu-zabbix.com`
- Token: Obtido no passo anterior
- Usuário/Senha: Para autenticação básica (opcional)

**Configuração CORS (se necessário):**
```apache
# No arquivo de configuração do Apache do Zabbix
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
```

### Elasticsearch

1. **Estrutura de índices esperada:**

**Para Infraestrutura:**
```json
{
  "host": {
    "name": "hostname-do-servidor",
    "hostname": "hostname-alternativo",
    "ip": "192.168.1.100",
    "os": {
      "name": "Ubuntu 20.04"
    }
  }
}
```

**Para APM:**
```json
{
  "service": {
    "name": "nome-do-servico"
  },
  "labels": {
    "domain": "exemplo.com"
  },
  "transaction": {
    "duration": {
      "us": 120000
    }
  }
}
```

2. **Configurações necessárias:**
- URL: `https://seu-elasticsearch.com:9200`
- Índices: `logs-*,metrics-*` (para infra) ou `apm-*` (para APM)
- Autenticação: Basic Auth ou Token Bearer

**Configuração CORS (se necessário):**
```yaml
# No elasticsearch.yml
http.cors.enabled: true
http.cors.allow-origin: "*"
http.cors.allow-methods: GET, POST, OPTIONS
http.cors.allow-headers: "Content-Type, Authorization"
```

### Dynatrace

1. **Criar API Token:**
   - Acesse Settings > Integration > Dynatrace API
   - Gere token com escopo: `entities.read`, `problems.read`

2. **Configurações necessárias:**
- URL: `https://seu-ambiente.live.dynatrace.com`
- Token: API Token gerado
- Host Group Filter: Filtro opcional para grupos específicos

**Configuração CORS:**
O Dynatrace geralmente permite CORS por padrão para requisições autenticadas, mas se houver problemas, configure um proxy reverso.

## Fluxo de Configuração

### 1. Acessar Área Administrativa
- URL: `/login`
- Credenciais padrão: `admin` / `vivo123`
- **IMPORTANTE**: Alterar credenciais em produção

### 2. Configurar Ferramentas
1. Clique em "Configurar Ferramentas"
2. Configure cada ferramenta nas respectivas abas:
   - **Zabbix** (Infraestrutura apenas)
   - **Elastic** (Infraestrutura e APM)
   - **Dynatrace** (Infraestrutura apenas)

3. Teste as conexões usando o botão "Testar Conexão"

### 3. Validar Configurações
- As configurações são salvas no localStorage
- Status das configurações é exibido no painel administrativo

## Uso da Aplicação

### Consulta de Monitoramento

1. **Acessar:** `/consulta` ou página inicial
2. **Selecionar ferramentas:** Checkboxes disponíveis
3. **Escolher tipo:**
   - **Infraestrutura**: Consulta hosts em Zabbix, Elastic e Dynatrace
   - **APM**: Consulta aplicações apenas no Elastic

4. **Formato de consulta:**
   - Hosts separados por vírgula ou ponto e vírgula
   - Exemplo: `server1, server2; server3domain`

### Tipos de Consulta

#### Infraestrutura
- **Zabbix**: Busca por nome do host
- **Elasticsearch**: Busca nos campos `host.name` e `host.hostname`
- **Dynatrace**: Busca por nome da entidade

#### APM
- **Elasticsearch**: Busca no campo `labels.domain`

## Segurança

### Credenciais
- As configurações são armazenadas no localStorage do navegador
- **RECOMENDAÇÃO**: Implementar backend seguro para armazenar credenciais

### Autenticação
- Login administrativo atual é básico
- **RECOMENDAÇÃO**: Integrar com sistema de autenticação corporativo

### HTTPS
- **OBRIGATÓRIO**: Usar HTTPS em produção
- Configurar certificados SSL válidos

## Troubleshooting

### Erros de CORS:
- **Erro**: "Failed to fetch" ou "CORS policy"
- **Solução**: Configure CORS nos servidores ou use proxy reverso
- **Alternativa**: Use extensão de browser para desabilitar CORS (apenas desenvolvimento)

### Erros Comuns

1. **"Configuração incompleta"**
   - Verificar se URL e credenciais estão preenchidas
   - Testar conectividade com as APIs

2. **"Erro na API Zabbix"**
   - Verificar se o token não expirou
   - Confirmar permissões do usuário

3. **"Erro na API Elasticsearch"**
   - Verificar autenticação
   - Confirmar estrutura dos índices

4. **"Erro na API Dynatrace"**
   - Verificar escopo do token
   - Confirmar URL do ambiente

### Logs
- Erros detalhados aparecem no console do navegador
- Use as ferramentas de desenvolvedor para debug

## Personalização

### Modificar Credenciais de Login
Editar arquivo `src/pages/Index.tsx`:
```typescript
if (credentials.username === "SEU_USUARIO" && credentials.password === "SUA_SENHA") {
```

### Adicionar Novos Campos
1. Modificar interfaces em `src/lib/api-services.ts`
2. Atualizar renderização em `src/components/dashboard/enhanced-monitoring-results.tsx`

### Configurar Índices Padrão
Editar configuração inicial em `src/pages/Consulta.tsx` e `src/pages/Index.tsx`

## Deploy

### Build
```bash
npm run build
```

### Variáveis de Ambiente
- A aplicação não usa variáveis de ambiente
- Todas as configurações são gerenciadas via interface

### Servidor Web
- Configurar servidor para servir arquivos estáticos
- Configurar redirects para SPA (Single Page Application)

## Monitoramento da Aplicação

### Métricas Recomendadas
- Tempo de resposta das APIs
- Taxa de erro nas consultas
- Uso da aplicação por usuários

### Logs de Aplicação
- Implementar logging centralizado
- Monitorar erros de API

## Suporte

Para questões técnicas:
1. Verificar logs no console do navegador
2. Testar conectividade com APIs manualmente
3. Consultar documentação das APIs das ferramentas de monitoramento