# Portal EAD Taxista VIX - Oracle Cloud Infrastructure

Infraestrutura completa para deploy do **Portal EAD Taxista VIX** na Oracle Cloud com pipeline CI/CD automatizado.

## 🏗️ Arquitetura da Solução

```
GitHub → Actions CI/CD → Webhook → Oracle Cloud VM
                                        ↓
    Internet → Nginx (80/443) → {
      /         → Frontend React (3000)
      /api      → Backend FastAPI (8001)  
      /moodle   → Moodle LMS (8080)
    }
    
    Databases:
    - MongoDB (27017) ← EAD Application
    - PostgreSQL (5432) ← Moodle
    
    Auth0 SSO ← Both Applications
```

## 🚀 Deploy Rápido (5 minutos)

### 1. Configuração Inicial

```bash
# Clone este repositório de infraestrutura
git clone https://github.com/periclesandrade21/portal-ead-taxista-vix.git
cd portal-ead-taxista-vix/terraform

# Configure as variáveis
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Preencha com suas credenciais
```

### 2. Deploy Automático

```bash
# Execute o deploy completo
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

### 3. Configure CI/CD (Opcional)

```bash
# Configure GitHub Actions
./scripts/setup-github-actions.sh
```

## 📋 Configuração do terraform.tfvars

```hcl
# Oracle Cloud Infrastructure
tenancy_ocid     = "ocid1.tenancy.oc1..aaaaaaaa..."
user_ocid        = "ocid1.user.oc1..aaaaaaaa..."
fingerprint      = "aa:bb:cc:dd:ee:ff..."
private_key_path = "~/.oci/oci_api_key.pem"
region           = "us-ashburn-1"
compartment_id   = "ocid1.compartment.oc1..aaaaaaaa..."

# SSH Key
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB..."

# GitHub Repository (já configurado)
github_repo = "https://github.com/periclesandrade21/portal-ead-taxista-vix.git"

# Auth0 Configuration
auth0_domain        = "taxista-es.auth0.com"
auth0_client_id     = "your-client-id"
auth0_client_secret = "your-client-secret"

# Senhas dos bancos (altere!)
mongo_password    = "SuaSenhaSegura123!"
postgres_password = "SuaSenhaMoodle123!"
```

## 🔧 Recursos Implementados

### ✅ Aplicação EAD Completa
- **Frontend React** - Interface moderna para taxistas
- **Backend FastAPI** - API robusta com MongoDB
- **Painel Administrativo** - Gestão completa de alunos
- **Sistema de Pagamento PIX** - Integrado com QR Code
- **Certificados Automáticos** - Válidos nacionalmente

### ✅ Moodle LMS Integrado
- **Moodle 4.3** - Plataforma LMS completa
- **PostgreSQL** - Banco dedicado
- **Cursos Interativos** - Fóruns, quizzes, certificados
- **Single Sign-On** - Integração com Auth0

### ✅ CI/CD Pipeline
- **GitHub Actions** - Deploy automático
- **Webhook Integration** - Deploy em tempo real
- **Health Checks** - Verificação automática
- **Rollback** - Reversão rápida em caso de falha

### ✅ Infraestrutura
- **Oracle Cloud VM** - Always Free tier
- **Docker Containers** - Aplicações isoladas
- **Nginx Reverse Proxy** - Load balancing
- **SSL/TLS Ready** - Certificados Let's Encrypt

## 🌐 URLs da Aplicação

Após o deploy, sua aplicação estará disponível em:

- **EAD Platform**: `http://YOUR_IP/`
- **Admin Panel**: `http://YOUR_IP/admin` (admin / admin@123)
- **Moodle LMS**: `http://YOUR_IP/moodle` (admin / Admin@123!)
- **API Health**: `http://YOUR_IP/api/health`
- **Webhook**: `http://YOUR_IP:9000/webhook`

## 🔄 Pipeline CI/CD

### Fluxo Automatizado
1. **Push para main** → Dispara GitHub Actions
2. **Tests** → Frontend + Backend
3. **Build** → Imagens Docker
4. **Deploy** → Via webhook para Oracle Cloud
5. **Health Check** → Verificação automática
6. **Notify** → Status do deployment

### Configuração do Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Portal EAD Taxista VIX
on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  test: # Testes automatizados
  build: # Build das imagens Docker  
  deploy: # Deploy via webhook
  notify: # Notificações
```

## 🔐 Auth0 Integration

### Configuração SSO
- **SPA Application** para Frontend React
- **Regular Web App** para Moodle
- **API Authentication** para Backend
- **Role-based Access** (admin, student, instructor)

### Roles Disponíveis
- `admin`: Acesso total ao painel administrativo
- `student`: Acesso ao portal do aluno
- `instructor`: Criação e gestão de cursos

## 💰 Custos (Oracle Cloud)

### Always Free Tier
- **VM.StandardE2.1.Micro**: Gratuito
- **Block Storage (50GB)**: Gratuito
- **Outbound Transfer (10TB)**: Gratuito
- **Networking**: Gratuito

**💰 Total mensal: R$ 0,00**

## 🛠️ Administração

### Comandos Úteis

```bash
# SSH para o servidor
ssh ubuntu@YOUR_SERVER_IP

# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Restart todos os serviços
docker-compose restart

# Atualizar código manualmente
cd portal-ead-taxista-vix
git pull origin main
cd ..
./deploy.sh
```

### Backup dos Dados

```bash
# Backup MongoDB
docker exec taxista-mongodb mongodump --archive=/tmp/backup-$(date +%Y%m%d).archive

# Backup PostgreSQL
docker exec taxista-postgres pg_dump -U moodle moodle > backup-moodle-$(date +%Y%m%d).sql

# Copiar backups para local
scp ubuntu@YOUR_SERVER_IP:/tmp/backup-*.* ./backups/
```

## 🔒 Segurança

### Configurações de Produção
- 🔐 **Firewall**: Apenas portas necessárias abertas
- 🔑 **SSH Keys**: Autenticação por chave
- 🛡️ **SSL/TLS**: Certificados automáticos
- 🔄 **Auto Updates**: Sistema sempre atualizado
- 📊 **Monitoring**: Logs centralizados

### Alteração de Senhas Padrão

```bash
# Via painel administrativo
# 1. EAD Admin: http://YOUR_IP/admin
# 2. Moodle Admin: http://YOUR_IP/moodle

# Via linha de comando
ssh ubuntu@YOUR_SERVER_IP
docker exec -it taxista-mongodb mongo admin -u admin -p
docker exec -it taxista-postgres psql -U moodle
```

## 🧪 Testing

### Testes Locais
```bash
# Frontend
cd frontend
npm test

# Backend  
cd backend
pytest tests/ -v
```

### Testes de Integração
```bash
# Health checks
curl http://YOUR_SERVER_IP/api/health

# Auth flow
curl -H "Authorization: Bearer TOKEN" http://YOUR_SERVER_IP/api/user/profile
```

## 📊 Monitoramento

### Métricas Disponíveis
- Status dos containers
- Uso de CPU/Memória
- Logs de aplicação
- Métricas de banco de dados

### Dashboards
- **Docker Stats**: `docker stats`
- **System Monitor**: `htop`
- **Application Logs**: `docker-compose logs`

## 🚨 Troubleshooting

### Problemas Comuns

#### Serviços não inicializando
```bash
# Verificar logs
docker-compose logs

# Recriar containers
docker-compose down && docker-compose up -d --build
```

#### Pipeline CI/CD falha
```bash
# Verificar webhook
curl -X POST http://YOUR_SERVER_IP:9000/webhook

# Ver logs do webhook
docker logs taxista-webhook
```

#### SSL não funciona
```bash
# Configurar certificado
ssh ubuntu@YOUR_SERVER_IP
sudo certbot --nginx -d your-domain.com
```

## 📞 Suporte

### Contatos Técnicos
- **Email**: suporte@sindtaxi-es.org  
- **Telefone**: (27) 3191-1727
- **GitHub Issues**: [Portal EAD Issues](https://github.com/periclesandrade21/portal-ead-taxista-vix/issues)

### Documentação Adicional
- 📖 [Auth0 Integration Guide](../auth0-integration.md)
- 🔄 [CI/CD Pipeline Guide](github-actions/README.md)
- 🐳 [Docker Configuration](../docker-compose.yml)

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] Multi-tenant (vários sindicatos)
- [ ] App mobile (React Native)
- [ ] Analytics avançados
- [ ] Integração com sistemas de pagamento
- [ ] Certificação digital blockchain
- [ ] API REST completa

### Melhorias de Infraestrutura
- [ ] Load balancer
- [ ] Database clustering
- [ ] CDN integration
- [ ] Monitoring stack (Prometheus/Grafana)
- [ ] Log aggregation (ELK Stack)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**🎉 Desenvolvido com 💙 para os Taxistas do Espírito Santo**