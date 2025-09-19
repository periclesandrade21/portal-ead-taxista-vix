# Moodle Integration for EAD Taxista ES

Este diretório contém a configuração para integração do Moodle LMS com a plataforma EAD Taxista ES.

## Arquitetura

- **Moodle**: Sistema de gestão de aprendizagem (LMS) containerizado  
- **PostgreSQL**: Banco de dados do Moodle
- **PgAdmin**: Interface de administração do banco de dados
- **Integração**: APIs para sincronização com plataforma principal

## Configuração Inicial

### 1. Iniciar os Serviços

```bash
cd /app/moodle
docker-compose up -d
```

### 2. Verificar Status dos Serviços

```bash
docker-compose ps
```

### 3. Acessar Interfaces

- **Moodle**: http://localhost:8080
  - Usuário: admin  
  - Senha: admin_secure_password_2024

- **PgAdmin**: http://localhost:5050
  - Email: admin@sindtaxi-es.org
  - Senha: pgadmin_secure_password_2024

### 4. Configurar Web Services do Moodle

1. Acesse: Site Administration > Plugins > Web services > Overview
2. Siga os passos para habilitar web services
3. Crie usuário de serviço para integração API
4. Gere token de autenticação
5. Configure endpoints necessários
6. Atualize o arquivo .env com o token gerado

## Estrutura de Arquivos

```
/app/moodle/
├── docker-compose.yml    # Configuração dos containers
├── .env                  # Variáveis de ambiente  
├── README.md            # Este arquivo
├── custom-config/       # Configurações customizadas do Moodle
├── init-scripts/        # Scripts de inicialização do banco
└── backups/            # Backups do sistema
```

## Integração com Plataforma Principal

A integração será implementada através de:

1. **Web Services API**: Comunicação entre FastAPI e Moodle
2. **SSO (Single Sign-On)**: Autenticação unificada  
3. **Webhook de Pagamentos**: Liberação automática de cursos
4. **Sincronização de Usuários**: Criação automática de contas
5. **Certificados**: Geração e verificação automática

## Próximos Passos

1. ✅ Setup inicial do Moodle dockerizado
2. ⏳ Configuração dos Web Services  
3. ⏳ Implementação do cliente API em Python
4. ⏳ Integração com sistema de pagamentos
5. ⏳ Sistema de certificados
6. ⏳ Deploy em produção

## Comandos Úteis

```bash
# Ver logs do Moodle
docker-compose logs -f moodle

# Acessar container do Moodle
docker-compose exec moodle bash

# Backup do banco de dados
docker-compose exec moodle-db pg_dump -U moodleuser moodle > backup.sql

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO!)
docker-compose down -v
```

## Troubleshooting

### Problema: Moodle não inicia
- Verificar logs: `docker-compose logs moodle`
- Verificar se o banco está rodando: `docker-compose ps`
- Verificar variáveis de ambiente no .env

### Problema: Erro de conexão com banco
- Verificar credenciais no .env
- Aguardar inicialização completa do PostgreSQL
- Verificar network connectivity entre containers

### Problema: Porta já em uso
- Alterar portas no docker-compose.yml
- Verificar processos em execução: `netstat -tulpn`