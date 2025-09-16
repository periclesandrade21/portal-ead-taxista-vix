# GitHub Actions CI/CD Pipeline

Este pipeline automatiza o deploy da aplicação Portal EAD Taxista VIX na Oracle Cloud.

## 🔧 Configuração

### 1. Secrets necessários no GitHub

Vá em `Settings > Secrets and variables > Actions` e adicione:

```bash
# Webhook Configuration
WEBHOOK_SECRET=taxista-webhook-secret-2025
WEBHOOK_URL=http://YOUR_SERVER_IP:9000/webhook

# Application URLs
APP_URL=http://YOUR_SERVER_IP
```

### 2. Configuração do Webhook no GitHub

1. Vá nas configurações do repositório
2. Clique em "Webhooks"
3. Clique em "Add webhook"
4. Configure:
   - **Payload URL**: `http://YOUR_SERVER_IP:9000/webhook`
   - **Content type**: `application/json`
   - **Secret**: `taxista-webhook-secret-2025`
   - **Events**: Marque "Just the push event"
   - **Active**: ✅

## 🚀 Fluxo do Pipeline

### 1. **Test Stage**
- ✅ Testa frontend (React)
- ✅ Testa backend (FastAPI)
- ✅ Executa build de produção
- ✅ Gera relatórios de cobertura

### 2. **Build Stage**
- 🐳 Constrói imagens Docker
- 📦 Publica no GitHub Container Registry
- 🏷️ Tagueia automaticamente

### 3. **Deploy Stage**
- 🚀 Dispara webhook para o servidor
- ⏳ Aguarda deployment completar
- 🏥 Executa health checks

### 4. **Notify Stage**
- ✅ Notifica sucesso/falha
- 📊 Mostra URLs da aplicação

## 📋 Triggers do Pipeline

O pipeline é executado quando:
- 📝 Push para branch `main` ou `master`
- 🔄 Pull request para `main` ou `master`
- 🎯 Execução manual via GitHub UI

## 🛠️ Comandos Úteis

### Executar pipeline manualmente
1. Vá para "Actions" no GitHub
2. Selecione "Deploy Portal EAD Taxista VIX"
3. Clique em "Run workflow"

### Ver logs do deployment
```bash
# SSH para o servidor
ssh ubuntu@YOUR_SERVER_IP

# Ver logs dos containers
docker-compose logs -f

# Ver logs do webhook
docker logs taxista-webhook -f
```

### Rollback manual
```bash
# SSH para o servidor
ssh ubuntu@YOUR_SERVER_IP

# Voltar para commit anterior
cd portal-ead-taxista-vix
git log --oneline -n 5  # Ver últimos commits
git checkout COMMIT_HASH
cd ..
./deploy.sh
```

## 🔒 Segurança

- 🔐 Webhook assinado com HMAC-SHA1
- 🔑 Secrets criptografados no GitHub
- 🛡️ Deploy apenas de branches protegidas
- 🔍 Health checks obrigatórios

## 📊 Monitoramento

### Status dos serviços
```bash
curl http://YOUR_SERVER_IP/api/health
```

### Métricas do container
```bash
docker stats
```

### Logs em tempo real
```bash
docker-compose logs -f --tail=100
```

## 🐛 Troubleshooting

### Pipeline falha nos testes
- Verifique os logs na aba "Actions"
- Certifique-se que todos os testes passam localmente

### Webhook não dispara
- Verifique o secret configurado
- Confirme a URL do webhook
- Veja os logs: `docker logs taxista-webhook`

### Aplicação não inicia após deploy
- SSH no servidor e execute: `docker-compose logs`
- Verifique se as variáveis de ambiente estão corretas
- Confirme se as portas estão disponíveis

### SSL não funciona
```bash
# Configurar certificado SSL
ssh ubuntu@YOUR_SERVER_IP
sudo certbot --nginx -d your-domain.com
```

## 📈 Melhorias Futuras

- [ ] Testes de integração E2E
- [ ] Deploy em múltiplos ambientes (staging/prod)
- [ ] Notificações Slack/Discord
- [ ] Métricas e alertas
- [ ] Backup automático antes do deploy
- [ ] Blue/green deployments