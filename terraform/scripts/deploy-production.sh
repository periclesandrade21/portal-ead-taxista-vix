#!/bin/bash

# Production deployment script with comprehensive setup

set -e

echo "🚀 Portal EAD Taxista VIX - Production Deployment"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if terraform.tfvars exists
    if [ ! -f "terraform.tfvars" ]; then
        print_error "terraform.tfvars file not found!"
        echo "Please copy terraform.tfvars.example to terraform.tfvars and configure it."
        exit 1
    fi
    
    # Check required tools
    local tools=("terraform" "git" "curl" "jq")
    for tool in "${tools[@]}"; do
        if ! command -v $tool &> /dev/null; then
            print_error "$tool is not installed!"
            exit 1
        fi
    done
    
    print_success "All prerequisites met"
}

# Deploy infrastructure
deploy_infrastructure() {
    print_status "Deploying infrastructure with Terraform..."
    
    # Initialize Terraform
    terraform init
    
    # Plan deployment
    print_status "Planning Terraform deployment..."
    terraform plan -out=tfplan
    
    # Ask for confirmation
    echo ""
    read -p "🤔 Do you want to proceed with the deployment? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        print_warning "Deployment cancelled."
        rm -f tfplan
        exit 0
    fi
    
    # Apply deployment
    print_status "Applying Terraform configuration..."
    terraform apply tfplan
    rm -f tfplan
    
    print_success "Infrastructure deployed successfully!"
}

# Get deployment information
get_deployment_info() {
    print_status "Retrieving deployment information..."
    
    PUBLIC_IP=$(terraform output -raw instance_public_ip)
    WEBHOOK_URL=$(terraform output -raw webhook_url)
    
    print_success "Deployment information retrieved"
    echo "   Public IP: $PUBLIC_IP"
    echo "   Webhook URL: $WEBHOOK_URL"
}

# Setup GitHub Actions
setup_github_actions() {
    print_status "Setting up GitHub Actions CI/CD..."
    
    if [ -f "scripts/setup-github-actions.sh" ]; then
        chmod +x scripts/setup-github-actions.sh
        ./scripts/setup-github-actions.sh
        print_success "GitHub Actions configured"
    else
        print_warning "GitHub Actions setup script not found"
        print_status "Manual setup required - see README.md"
    fi
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        print_status "Checking services... (attempt $attempt/$max_attempts)"
        
        # Check if SSH is ready
        if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no ubuntu@$PUBLIC_IP "echo 'SSH ready'" 2>/dev/null; then
            print_success "SSH connection established"
            break
        fi
        
        sleep 10
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Services did not start within expected time"
        print_warning "This is normal for initial deployment. Services may take 10-15 minutes to fully initialize."
    fi
}

# Health check
perform_health_check() {
    print_status "Performing health checks..."
    
    local services=(
        "Application:http://$PUBLIC_IP"
        "API:http://$PUBLIC_IP/api/health"
        "Moodle:http://$PUBLIC_IP/moodle"
    )
    
    sleep 60  # Wait a bit more for services to start
    
    for service in "${services[@]}"; do
        local name=$(echo $service | cut -d: -f1)
        local url=$(echo $service | cut -d: -f2-)
        
        if curl -f --max-time 10 "$url" > /dev/null 2>&1; then
            print_success "$name is healthy"
        else
            print_warning "$name is not responding yet (this is normal during initial setup)"
        fi
    done
}

# Setup SSL (optional)
setup_ssl() {
    local domain_name=$(terraform output -raw domain_name 2>/dev/null || echo "")
    
    if [ -n "$domain_name" ] && [ "$domain_name" != "" ]; then
        print_status "Setting up SSL certificate for $domain_name..."
        
        ssh -o StrictHostKeyChecking=no ubuntu@$PUBLIC_IP << EOF
            sudo certbot --nginx -d $domain_name --non-interactive --agree-tos --email admin@$domain_name
            sudo systemctl reload nginx
EOF
        
        print_success "SSL certificate configured for $domain_name"
    else
        print_warning "No domain configured. SSL setup skipped."
        print_status "To setup SSL later, run: ssh ubuntu@$PUBLIC_IP 'sudo certbot --nginx'"
    fi
}

# Display final information
display_final_info() {
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📍 Server Information:"
    echo "   Public IP: $PUBLIC_IP"
    echo "   SSH: ssh ubuntu@$PUBLIC_IP"
    echo ""
    echo "🌐 Application URLs:"
    echo "   EAD Platform: http://$PUBLIC_IP"
    echo "   Moodle LMS: http://$PUBLIC_IP/moodle"
    echo "   API Health: http://$PUBLIC_IP/api/health"
    echo "   Webhook: $WEBHOOK_URL"
    echo ""
    echo "🔐 Default Credentials:"
    echo "   Moodle Admin: admin / Admin@123!"
    echo "   EAD Admin: admin / admin@123"
    echo ""
    echo "📝 Next Steps:"
    if [ -z "$(terraform output -raw domain_name 2>/dev/null)" ]; then
        echo "   1. Configure your domain DNS to point to: $PUBLIC_IP"
        echo "   2. Update terraform.tfvars with your domain"
        echo "   3. Run 'terraform apply' again to configure SSL"
    fi
    echo "   4. Update Auth0 callback URLs to include: http://$PUBLIC_IP"
    echo "   5. Push code changes to trigger CI/CD pipeline"
    echo "   6. Monitor deployment: https://github.com/periclesandrade21/portal-ead-taxista-vix/actions"
    echo ""
    echo "🔧 Management Commands:"
    echo "   Monitor services: ssh ubuntu@$PUBLIC_IP 'docker-compose ps'"
    echo "   View logs: ssh ubuntu@$PUBLIC_IP 'docker-compose logs -f'"
    echo "   Restart services: ssh ubuntu@$PUBLIC_IP 'docker-compose restart'"
    echo ""
    echo "📚 Documentation:"
    echo "   README.md - Complete setup guide"
    echo "   auth0-integration.md - Auth0 configuration"
    echo "   github-actions/README.md - CI/CD pipeline guide"
    echo ""
}

# Cleanup on error
cleanup_on_error() {
    if [ $? -ne 0 ]; then
        print_error "Deployment failed!"
        print_status "Cleaning up..."
        rm -f tfplan
        print_status "Check the error messages above and try again"
        exit 1
    fi
}

# Set error trap
trap cleanup_on_error ERR

# Main deployment flow
main() {
    echo "Starting deployment at $(date)"
    
    check_prerequisites
    deploy_infrastructure
    get_deployment_info
    setup_github_actions
    wait_for_services
    perform_health_check
    setup_ssl
    display_final_info
    
    echo "Deployment completed at $(date)"
}

# Run main function
main "$@"