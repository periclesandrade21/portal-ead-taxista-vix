#!/bin/bash

# Script para configurar e subir arquivos para o GitHub

set -e

echo "🚀 Configurando Git e subindo arquivos para GitHub"
echo "=================================================="

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "main.tf" ]; then
    echo "❌ Erro: Execute este script no diretório terraform/"
    exit 1
fi

# Voltar para o diretório raiz do projeto
cd ..

# Verificar se já é um repositório git
if [ ! -d ".git" ]; then
    print_status "Inicializando repositório Git..."
    git init
    print_success "Repositório Git inicializado"
else
    print_status "Repositório Git já existe"
fi

# Configurar gitignore se não existir
if [ ! -f ".gitignore" ]; then
    print_status "Criando .gitignore..."
    cat > .gitignore << 'EOF'
# Terraform
*.tfstate
*.tfstate.*
.terraform/
.terraform.lock.hcl
terraform.tfvars
*.tfplan

# OS
.DS_Store
Thumbs.db
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# Node modules
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
.env

# Build outputs
build/
dist/
*.egg-info/

# Secrets and keys
*.pem
*.key
.env
secrets/
terraform.tfvars

# Backups
*.backup
backup/

# Logs
*.log
logs/

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output/

# Dependencies
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# Next.js build output
.next

# Nuxt.js build output
.nuxt

# Storybook build outputs
.out
.storybook-out

# Database
*.db
*.sqlite

# Temporary folders
tmp/
temp/
EOF
    print_success ".gitignore criado"
fi

# Verificar se o remote origin existe
if ! git remote get-url origin > /dev/null 2>&1; then
    print_status "Configurando remote origin..."
    git remote add origin https://github.com/periclesandrade21/portal-ead-taxista-vix.git
    print_success "Remote origin configurado"
else
    print_status "Remote origin já existe"
    # Verificar se é o repositório correto
    CURRENT_REMOTE=$(git remote get-url origin)
    EXPECTED_REMOTE="https://github.com/periclesandrade21/portal-ead-taxista-vix.git"
    
    if [ "$CURRENT_REMOTE" != "$EXPECTED_REMOTE" ]; then
        print_warning "Remote atual: $CURRENT_REMOTE"
        print_warning "Esperado: $EXPECTED_REMOTE"
        read -p "Deseja atualizar o remote? (y/N): " update_remote
        if [[ $update_remote == [yY] ]]; then
            git remote set-url origin $EXPECTED_REMOTE
            print_success "Remote atualizado"
        fi
    fi
fi

# Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ -z "$CURRENT_BRANCH" ]; then
    print_status "Criando branch main..."
    git checkout -b main
    print_success "Branch main criada"
elif [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    print_warning "Branch atual: $CURRENT_BRANCH"
    read -p "Deseja mudar para a branch main? (y/N): " change_branch
    if [[ $change_branch == [yY] ]]; then
        git checkout -b main 2>/dev/null || git checkout main
        print_success "Mudou para branch main"
    fi
fi

# Verificar se há mudanças para commit
if git diff --quiet && git diff --staged --quiet; then
    # Verificar se há arquivos não rastreados
    if [ -z "$(git ls-files --others --exclude-standard)" ]; then
        print_warning "Não há mudanças para commit"
        exit 0
    fi
fi

# Adicionar todos os arquivos
print_status "Adicionando arquivos ao Git..."
git add .

# Verificar o que será commitado
print_status "Arquivos que serão commitados:"
git diff --staged --name-only

echo ""
read -p "Continuar com o commit? (y/N): " continue_commit
if [[ $continue_commit != [yY] ]]; then
    print_warning "Operação cancelada"
    exit 0
fi

# Fazer commit
print_status "Fazendo commit..."
COMMIT_MESSAGE="feat: Add complete infrastructure and CI/CD pipeline

- Oracle Cloud Infrastructure with Terraform
- Docker containers for all services (Frontend, Backend, Moodle, MongoDB, PostgreSQL)
- GitHub Actions CI/CD pipeline with automated testing
- Auth0 SSO integration for both EAD and Moodle
- Nginx reverse proxy with SSL support
- Webhook-based deployment system
- Production-ready configuration with monitoring

Components:
- EAD Platform (React + FastAPI + MongoDB)
- Moodle LMS (PHP + PostgreSQL)
- CI/CD Pipeline (GitHub Actions + Webhook)
- Infrastructure as Code (Terraform)
- SSL/TLS ready with Let's Encrypt
- Always Free Oracle Cloud tier"

git commit -m "$COMMIT_MESSAGE"
print_success "Commit realizado"

# Push para o repositório
print_status "Enviando para GitHub..."

# Verificar se é o primeiro push
if ! git ls-remote --exit-code origin > /dev/null 2>&1; then
    print_status "Primeiro push - configurando upstream..."
    git push -u origin main
else
    # Verificar se a branch existe no remote
    if git ls-remote --exit-code origin main > /dev/null 2>&1; then
        git push origin main
    else
        print_status "Branch main não existe no remote - criando..."
        git push -u origin main
    fi
fi

print_success "Arquivos enviados para GitHub com sucesso!"

echo ""
echo "🎉 Repositório configurado com sucesso!"
echo ""
echo "📍 Repositório: https://github.com/periclesandrade21/portal-ead-taxista-vix"
echo "🔄 Actions: https://github.com/periclesandrade21/portal-ead-taxista-vix/actions"
echo ""
echo "📋 Próximos passos:"
echo "   1. Configure terraform.tfvars com suas credenciais Oracle Cloud"
echo "   2. Execute o deploy: ./terraform/scripts/deploy-production.sh"
echo "   3. Configure Auth0 conforme documentação"
echo "   4. Configure GitHub Actions secrets"
echo ""
echo "📚 Documentação disponível:"
echo "   - README.md - Guia completo"
echo "   - terraform/README.md - Infraestrutura"
echo "   - auth0-integration.md - Configuração Auth0"
echo ""