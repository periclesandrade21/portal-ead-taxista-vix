#!/bin/bash

# Deploy script for Taxista EAD platform on Oracle Cloud

set -e

echo "🚀 Starting deployment of Taxista EAD platform..."

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo "❌ Error: terraform.tfvars file not found!"
    echo "Please copy terraform.tfvars.example to terraform.tfvars and fill in your values."
    exit 1
fi

# Initialize Terraform
echo "📋 Initializing Terraform..."
terraform init

# Plan the deployment
echo "📊 Planning Terraform deployment..."
terraform plan

# Ask for confirmation
read -p "🤔 Do you want to proceed with the deployment? (y/N): " confirm
if [[ $confirm != [yY] ]]; then
    echo "❌ Deployment cancelled."
    exit 1
fi

# Apply the deployment
echo "🏗️ Applying Terraform configuration..."
terraform apply -auto-approve

# Get the public IP
PUBLIC_IP=$(terraform output -raw instance_public_ip)

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📍 Server Information:"
echo "   Public IP: $PUBLIC_IP"
echo "   SSH: ssh ubuntu@$PUBLIC_IP"
echo ""
echo "🌐 Application URLs (wait 5-10 minutes for services to start):"
echo "   EAD Platform: http://$PUBLIC_IP"
echo "   Moodle: http://$PUBLIC_IP/moodle"
echo "   API: http://$PUBLIC_IP/api"
echo ""
echo "🔐 Default Credentials:"
echo "   Moodle Admin: admin / Admin@123!"
echo "   EAD Admin: admin / admin@123"
echo ""
echo "📝 Next Steps:"
echo "   1. Wait 5-10 minutes for all services to start"
echo "   2. Configure SSL certificate: ssh ubuntu@$PUBLIC_IP 'sudo certbot --nginx'"
echo "   3. Update Auth0 callback URLs to include: http://$PUBLIC_IP"
echo "   4. Configure DNS to point your domain to: $PUBLIC_IP"
echo ""