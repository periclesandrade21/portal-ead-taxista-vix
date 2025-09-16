# Taxista EAD Platform - Oracle Cloud Deployment

Esta é a infraestrutura completa para deploy da plataforma EAD Taxista ES na Oracle Cloud, incluindo:

- **Aplicação EAD Taxistas** (React + FastAPI + MongoDB)
- **Moodle LMS** (PHP + PostgreSQL)
- **Auth0 Single Sign-On** para ambas as plataformas
- **Nginx** como reverse proxy

## 🏗️ Arquitetura

```
Internet → Nginx (80/443) → {
  /         → Frontend React (3000)
  /api      → Backend FastAPI (8001)
  /moodle   → Moodle LMS (8080)
}

Databases:
- MongoDB (27017) ← EAD Application
- PostgreSQL (5432) ← Moodle
```

## 📋 Pré-requisitos

### 1. Oracle Cloud Infrastructure
- Conta OCI ativa
- Chaves API configuradas
- Compartment criado

### 2. Auth0 Account
- Conta Auth0 ativa
- Aplicações configuradas (SPA + Regular Web App)

### 3. Ferramentas Locais
- Terraform >= 1.0
- SSH key pair

## 🚀 Deploy Rápido

### 1. Configuração Inicial

```bash
# Clone os arquivos de configuração
cd terraform/

# Copie e configure as variáveis
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars
```

### 2. Configure terraform.tfvars

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

# Auth0 Configuration
auth0_domain        = "taxista-es.auth0.com"
auth0_client_id     = "your-client-id"
auth0_client_secret = "your-client-secret"

# Database Passwords
mongo_password    = "SecurePassword123!"
postgres_password = "MoodlePassword123!"
```

### 3. Deploy

```bash
# Torne o script executável
chmod +x scripts/deploy.sh

# Execute o deploy
./scripts/deploy.sh
```

## 🔧 Configuração Manual Pós-Deploy

### 1. Auth0 Setup

```bash
# Execute o script de configuração do Auth0
./scripts/setup-auth0.sh YOUR_SERVER_IP
```

### 2. SSL Certificate (Opcional)

```bash
# SSH para o servidor
ssh ubuntu@YOUR_SERVER_IP

# Configure SSL com Let's Encrypt
sudo certbot --nginx
```

### 3. DNS Configuration

Aponte seu domínio para o IP público do servidor.

## 📱 Aplicações

### EAD Taxista ES
- **URL**: `http://YOUR_IP/`
- **Admin**: admin / admin@123
- **Features**: 
  - Cadastro de taxistas
  - Cursos CONTRAN
  - Certificados
  - Pagamento PIX

### Moodle LMS
- **URL**: `http://YOUR_IP/moodle`
- **Admin**: admin / Admin@123!
- **Features**:
  - Cursos completos
  - Fóruns
  - Quizzes
  - Certificados

## 🔐 Auth0 Integration

### Frontend (React)
```javascript
// Auth0 Provider configuration
const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

<Auth0Provider
  domain={domain}
  clientId={clientId}
  redirectUri={window.location.origin}
>
  <App />
</Auth0Provider>
```

### Backend (FastAPI)
```python
# JWT verification
from jose import jwt

def verify_token(token: str):
    return jwt.decode(token, key, audience=API_AUDIENCE)
```

## 🛠️ Administração

### Monitoramento de Containers

```bash
# SSH para o servidor
ssh ubuntu@YOUR_SERVER_IP

# Ver status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f

# Restart serviços
docker-compose restart
```

### Backup dos Dados

```bash
# Backup MongoDB
docker exec taxista-mongodb mongodump --archive=/backup.archive

# Backup PostgreSQL
docker exec taxista-postgres pg_dump -U moodle moodle > moodle_backup.sql
```

## 🔧 Troubleshooting

### Serviços não inicializando

```bash
# Verificar logs do cloud-init
sudo cat /var/log/cloud-init-output.log

# Verificar status do Docker
sudo systemctl status docker

# Recriar containers
docker-compose down && docker-compose up -d
```

### Problemas de conectividade

```bash
# Verificar security groups
# Verificar se as portas 80, 443, 22 estão abertas

# Testar conectividade interna
docker exec taxista-backend curl -f http://localhost:8001/api/health
```

## 💰 Custos Estimados (Oracle Cloud)

- **VM.StandardE2.1.Micro**: Gratuito (Always Free)
- **Block Storage (50GB)**: Gratuito (Always Free)
- **Outbound Data Transfer**: Gratuito (10TB/mês Always Free)

**Total mensal**: R$ 0,00 (dentro do free tier)

## 🚨 Segurança

### Recomendações de Produção

1. **Firewall**: Configure apenas as portas necessárias
2. **SSL**: Use certificados SSL válidos
3. **Backup**: Configure backup automático
4. **Monitoramento**: Configure alertas
5. **Updates**: Mantenha o sistema atualizado

### Alteração de Senhas Padrão

```bash
# MongoDB
docker exec -it taxista-mongodb mongo admin -u admin -p

# PostgreSQL
docker exec -it taxista-postgres psql -U moodle

# Aplicação
# Altere via painel administrativo
```

## 📞 Suporte

Para suporte técnico:
- Email: suporte@sindtaxi-es.org
- Telefone: (27) 3191-1727

## 📝 Licença

Este projeto está licenciado sob a Licença MIT.