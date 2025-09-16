#!/bin/bash

# Setup GitHub Actions for Portal EAD Taxista VIX

set -e

echo "🔧 GitHub Actions Setup for Portal EAD Taxista VIX"
echo "=================================================="

# Get server IP from terraform output
if [ -f "terraform.tfstate" ]; then
    SERVER_IP=$(terraform output -raw instance_public_ip 2>/dev/null || echo "")
else
    echo "⚠️  terraform.tfstate not found. Please run terraform apply first."
    read -p "Enter your server IP: " SERVER_IP
fi

if [ -z "$SERVER_IP" ]; then
    echo "❌ Server IP is required!"
    exit 1
fi

WEBHOOK_URL="http://${SERVER_IP}:9000/webhook"
APP_URL="http://${SERVER_IP}"
WEBHOOK_SECRET="taxista-webhook-secret-2025"

echo ""
echo "📋 Configuration Summary:"
echo "   Server IP: $SERVER_IP"
echo "   Webhook URL: $WEBHOOK_URL"
echo "   App URL: $APP_URL"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found!"
    echo "📥 Install it from: https://cli.github.com/"
    echo ""
    echo "🔧 Manual setup required:"
    echo "   1. Go to your repository on GitHub"
    echo "   2. Go to Settings > Secrets and variables > Actions"
    echo "   3. Add these secrets:"
    echo "      - WEBHOOK_SECRET: $WEBHOOK_SECRET"
    echo "      - WEBHOOK_URL: $WEBHOOK_URL"
    echo "      - APP_URL: $APP_URL"
    echo ""
    echo "   4. Go to Settings > Webhooks"
    echo "   5. Add webhook:"
    echo "      - Payload URL: $WEBHOOK_URL"
    echo "      - Content type: application/json"
    echo "      - Secret: $WEBHOOK_SECRET"
    echo "      - Events: Just the push event"
    exit 1
fi

# Check if user is logged in to GitHub
if ! gh auth status &> /dev/null; then
    echo "🔐 Please login to GitHub first:"
    gh auth login
fi

# Get repository info
REPO_INFO=$(gh repo view --json owner,name)
REPO_OWNER=$(echo $REPO_INFO | jq -r '.owner.login')
REPO_NAME=$(echo $REPO_INFO | jq -r '.name')

echo "📂 Repository: $REPO_OWNER/$REPO_NAME"

# Set GitHub secrets
echo "🔑 Setting up GitHub secrets..."

gh secret set WEBHOOK_SECRET --body "$WEBHOOK_SECRET"
gh secret set WEBHOOK_URL --body "$WEBHOOK_URL"
gh secret set APP_URL --body "$APP_URL"

echo "✅ Secrets configured successfully!"

# Create .github/workflows directory if it doesn't exist
if [ ! -d ".github/workflows" ]; then
    mkdir -p .github/workflows
    echo "📁 Created .github/workflows directory"
fi

# Copy workflow file
cp github-actions/deploy.yml .github/workflows/
echo "📝 Copied workflow file to .github/workflows/deploy.yml"

# Setup webhook
echo "🔗 Setting up repository webhook..."

# Check if webhook already exists
WEBHOOK_EXISTS=$(gh api repos/$REPO_OWNER/$REPO_NAME/hooks | jq -r --arg url "$WEBHOOK_URL" '.[] | select(.config.url == $url) | .id')

if [ -n "$WEBHOOK_EXISTS" ]; then
    echo "⚠️  Webhook already exists (ID: $WEBHOOK_EXISTS)"
    read -p "Do you want to update it? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
        gh api -X PATCH repos/$REPO_OWNER/$REPO_NAME/hooks/$WEBHOOK_EXISTS \
            --field name=web \
            --field config[url]="$WEBHOOK_URL" \
            --field config[content_type]=json \
            --field config[secret]="$WEBHOOK_SECRET" \
            --field events='["push"]' \
            --field active=true
        echo "✅ Webhook updated successfully!"
    fi
else
    gh api -X POST repos/$REPO_OWNER/$REPO_NAME/hooks \
        --field name=web \
        --field config[url]="$WEBHOOK_URL" \
        --field config[content_type]=json \
        --field config[secret]="$WEBHOOK_SECRET" \
        --field events='["push"]' \
        --field active=true
    echo "✅ Webhook created successfully!"
fi

echo ""
echo "🎉 GitHub Actions setup completed!"
echo ""
echo "📋 What was configured:"
echo "   ✅ GitHub secrets (WEBHOOK_SECRET, WEBHOOK_URL, APP_URL)"
echo "   ✅ Workflow file (.github/workflows/deploy.yml)"
echo "   ✅ Repository webhook"
echo ""
echo "🚀 Next steps:"
echo "   1. Commit and push the workflow file:"
echo "      git add .github/workflows/deploy.yml"
echo "      git commit -m 'Add CI/CD pipeline'"
echo "      git push origin main"
echo ""
echo "   2. The pipeline will run automatically on push to main branch"
echo ""
echo "   3. Monitor deployment:"
echo "      - GitHub Actions: https://github.com/$REPO_OWNER/$REPO_NAME/actions"
echo "      - Application: $APP_URL"
echo "      - Moodle: $APP_URL/moodle"
echo ""
echo "🔗 Useful links:"
echo "   - Repository: https://github.com/$REPO_OWNER/$REPO_NAME"
echo "   - Actions: https://github.com/$REPO_OWNER/$REPO_NAME/actions"
echo "   - Settings: https://github.com/$REPO_OWNER/$REPO_NAME/settings"
echo ""