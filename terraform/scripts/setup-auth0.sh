#!/bin/bash

# Auth0 Setup Script for Taxista EAD Platform

echo "🔐 Auth0 Setup Instructions for Taxista EAD Platform"
echo "================================================="
echo ""

PUBLIC_IP=${1:-"YOUR_SERVER_IP"}

echo "1. 📝 Create Auth0 Application:"
echo "   - Go to https://auth0.com/dashboard"
echo "   - Create a new 'Single Page Application' for the EAD frontend"
echo "   - Create a new 'Regular Web Application' for Moodle"
echo ""

echo "2. 🔧 Configure Application Settings:"
echo "   EAD Application:"
echo "   - Allowed Callback URLs: http://$PUBLIC_IP/callback, http://$PUBLIC_IP"
echo "   - Allowed Logout URLs: http://$PUBLIC_IP"
echo "   - Allowed Web Origins: http://$PUBLIC_IP"
echo "   - Allowed Origins (CORS): http://$PUBLIC_IP"
echo ""
echo "   Moodle Application:"
echo "   - Allowed Callback URLs: http://$PUBLIC_IP/moodle/auth/oauth2/login.php"
echo "   - Allowed Logout URLs: http://$PUBLIC_IP/moodle"
echo ""

echo "3. 🔑 API Configuration:"
echo "   - Create an API in Auth0 Dashboard"
echo "   - Set Identifier: https://taxista-ead-api"
echo "   - Enable RBAC and Add Permissions in Access Tokens"
echo ""

echo "4. 👥 User Roles Setup:"
echo "   Create these roles in Auth0:"
echo "   - 'admin': Full access to admin panel"
echo "   - 'student': Access to student portal"
echo "   - 'instructor': Access to create/manage courses"
echo ""

echo "5. 🔄 Update Environment Variables:"
echo "   Update your terraform.tfvars with the Auth0 credentials:"
echo "   - auth0_domain = 'your-domain.auth0.com'"
echo "   - auth0_client_id = 'your-client-id'"
echo "   - auth0_client_secret = 'your-client-secret'"
echo ""

echo "6. 🚀 Redeploy:"
echo "   Run 'terraform apply' to update the configuration"
echo ""

echo "📚 Integration Documentation:"
echo "   Frontend (React): https://auth0.com/docs/quickstart/spa/react"
echo "   Backend (FastAPI): https://auth0.com/docs/quickstart/backend/python"
echo "   Moodle: https://docs.moodle.org/en/OAuth_2_authentication"
echo ""