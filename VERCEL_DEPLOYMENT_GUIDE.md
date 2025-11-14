# Vercel Deployment Guide - Whispering Salamander Beam

Complete guide for setting up automated Vercel deployments via GitHub Actions, including GitHub Secrets configuration, CLI automation, and troubleshooting.

---

## Table of Contents

1. [Current Build Status Analysis](#1-current-build-status-analysis)
2. [Required GitHub Secrets Configuration](#2-required-github-secrets-configuration)
3. [Obtaining Secrets from Vercel Dashboard](#3-obtaining-secrets-from-vercel-dashboard)
4. [GitHub CLI Automation](#4-github-cli-automation)
5. [Vercel CLI Integration](#5-vercel-cli-integration)
6. [Complete Workflow File Configuration](#6-complete-workflow-file-configuration)
7. [Third-Party Automation Options](#7-third-party-automation-options)
8. [Verification Checklist](#8-verification-checklist)
9. [Build Testing & Troubleshooting](#9-build-testing--troubleshooting)

---

## 1. Current Build Status Analysis

### Build Configuration Overview

**Project Type:** React + Vite SPA with Vercel Serverless Functions

**Current Status:**
- ✅ **Frontend Build**: Vite-based React app with TypeScript
- ✅ **Backend API**: Vercel serverless functions in `api/` directory
- ✅ **Build Pipeline**: GitHub Actions workflow configured at `.github/workflows/deploy.yml`
- ⚠️ **Deployment**: Requires GitHub Secrets to be configured for automated deployments

### Build Pipeline Steps

The current workflow includes:

1. **Setup** (Node.js 20 + pnpm 8)
2. **Dependencies** (`pnpm install`)
3. **Type Checking** (`pnpm run typecheck`)
4. **Linting** (`pnpm run lint`)
5. **Build** (`pnpm run build`)
6. **Deploy** (Vercel Action with required secrets)

### Current Workflow Configuration

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Type check
        run: pnpm run typecheck
        
      - name: Lint
        run: pnpm run lint
        
      - name: Build
        run: pnpm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Issues to Address

- ❌ **Missing GitHub Secrets**: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` not configured
- ⚠️ **Deployment Fails**: Without secrets, the deploy step cannot authenticate with Vercel
- ✅ **Build Steps Pass**: All pre-deployment checks (typecheck, lint, build) work correctly

---

## 2. Required GitHub Secrets Configuration

Three secrets are required for automated Vercel deployments via GitHub Actions:

### Secret #1: `VERCEL_TOKEN`

**Purpose:** Authentication token for Vercel API access

**Type:** Personal or Team Access Token

**Scope:** Allows GitHub Actions to deploy to your Vercel account

**Security:** High - treat as a password, never commit to code

---

### Secret #2: `VERCEL_ORG_ID`

**Purpose:** Identifies your Vercel organization or personal account

**Type:** Organization/Account Identifier

**Format:** String like `team_xxxxxxxxxxxxx` or similar

**Usage:** Routes deployments to the correct Vercel account

---

### Secret #3: `VERCEL_PROJECT_ID`

**Purpose:** Identifies the specific Vercel project for deployments

**Type:** Project Identifier

**Format:** String like `prj_xxxxxxxxxxxxx`

**Usage:** Ensures deployments target the correct project within your account

---

## 3. Obtaining Secrets from Vercel Dashboard

Follow these detailed steps to retrieve each required secret from Vercel.

### Step 1: Create Vercel Access Token (`VERCEL_TOKEN`)

1. **Log in to Vercel**
   - Visit: https://vercel.com
   - Sign in with your account

2. **Navigate to Account Settings**
   - Click your profile picture (top-right corner)
   - Select **Settings** from dropdown

3. **Access Tokens Section**
   - In the left sidebar, click **Tokens**
   - URL: https://vercel.com/account/tokens

4. **Create New Token**
   - Click **Create Token** button
   - Enter a descriptive name: `GitHub Actions - whispering-salamander-beam`
   - Select scope:
     - **Full Account** (recommended) OR
     - **Specific Projects** (more restrictive)
   - Set expiration (optional but recommended for security)

5. **Copy Token Immediately**
   - ⚠️ **IMPORTANT**: Token is shown only once!
   - Click **Create** and immediately copy the token
   - Store securely - you cannot retrieve it later
   - Format: `vercel_xxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### Step 2: Get Organization ID (`VERCEL_ORG_ID`)

#### Method A: Via Vercel Dashboard

1. **Navigate to Project Settings**
   - Go to your Vercel dashboard: https://vercel.com/dashboard
   - Open your project: `whispering-salamander-beam`

2. **Open Settings**
   - Click **Settings** tab in project navigation

3. **Find Organization ID**
   - Scroll to **General** section
   - Look for **Team ID** or **Organization ID**
   - Copy the value (format: `team_xxxxxxxxxxxxx`)

#### Method B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to project (if not already linked)
vercel link

# View project information (includes org ID)
vercel inspect
```

The output will include:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  ...
}
```

#### Method C: From Project Configuration File

If you've previously run `vercel link`, check `.vercel/project.json`:

```bash
cat .vercel/project.json
```

Output:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

---

### Step 3: Get Project ID (`VERCEL_PROJECT_ID`)

#### Method A: Via Vercel Dashboard

1. **Navigate to Project Settings**
   - Go to: https://vercel.com/dashboard
   - Select project: `whispering-salamander-beam`
   - Click **Settings**

2. **General Section**
   - In the **General** tab
   - Find **Project ID**
   - Copy the value (format: `prj_xxxxxxxxxxxxx`)

#### Method B: Via Vercel CLI

```bash
# View project details
vercel inspect

# Or list all projects
vercel projects ls
```

#### Method C: From URL

The project ID is often visible in the Vercel dashboard URL:
```
https://vercel.com/[team-name]/[project-name]/[deployment-id]
                                                 ↑ Project ID in API responses
```

Or in project settings URL:
```
https://vercel.com/[team]/[project]/settings
```

Then use Vercel CLI or API to get the exact project ID.

#### Method D: From `.vercel/project.json`

```bash
cat .vercel/project.json
```

Output includes `projectId`:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

---

## 4. GitHub CLI Automation

Automate GitHub Secrets configuration using the `gh` CLI tool.

### Prerequisites

1. **Install GitHub CLI**

```bash
# macOS (Homebrew)
brew install gh

# Linux (Debian/Ubuntu)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Windows (WinGet)
winget install --id GitHub.cli

# Or download from: https://cli.github.com/
```

2. **Authenticate with GitHub**

```bash
gh auth login
```

Follow prompts to authenticate via browser or token.

3. **Verify Authentication**

```bash
gh auth status
```

---

### Setting Secrets with GitHub CLI

#### Option 1: Interactive Mode

```bash
# Set VERCEL_TOKEN
gh secret set VERCEL_TOKEN --repo stackconsult/whispering-salamander-beam

# You'll be prompted to enter the secret value
# Paste your Vercel token and press Enter

# Set VERCEL_ORG_ID
gh secret set VERCEL_ORG_ID --repo stackconsult/whispering-salamander-beam

# Set VERCEL_PROJECT_ID
gh secret set VERCEL_PROJECT_ID --repo stackconsult/whispering-salamander-beam
```

#### Option 2: Pipe from Environment Variables

```bash
# Set environment variables first
export VERCEL_TOKEN="your_vercel_token_here"
export VERCEL_ORG_ID="team_xxxxxxxxxxxxx"
export VERCEL_PROJECT_ID="prj_xxxxxxxxxxxxx"

# Set secrets from environment variables
echo $VERCEL_TOKEN | gh secret set VERCEL_TOKEN --repo stackconsult/whispering-salamander-beam
echo $VERCEL_ORG_ID | gh secret set VERCEL_ORG_ID --repo stackconsult/whispering-salamander-beam
echo $VERCEL_PROJECT_ID | gh secret set VERCEL_PROJECT_ID --repo stackconsult/whispering-salamander-beam
```

#### Option 3: From Secure File

```bash
# Store secrets in a file (add to .gitignore!)
cat > /tmp/vercel-secrets.env << 'EOF'
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=team_xxxxxxxxxxxxx
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxx
EOF

# Set secrets from file
gh secret set VERCEL_TOKEN < <(grep VERCEL_TOKEN /tmp/vercel-secrets.env | cut -d'=' -f2)
gh secret set VERCEL_ORG_ID < <(grep VERCEL_ORG_ID /tmp/vercel-secrets.env | cut -d'=' -f2)
gh secret set VERCEL_PROJECT_ID < <(grep VERCEL_PROJECT_ID /tmp/vercel-secrets.env | cut -d'=' -f2)

# Clean up
rm /tmp/vercel-secrets.env
```

#### Option 4: Automated Script

```bash
#!/bin/bash
# save as: setup-vercel-secrets.sh

set -e

REPO="stackconsult/whispering-salamander-beam"

echo "🔐 GitHub Secrets Setup for Vercel Deployment"
echo "=============================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install from: https://cli.github.com/"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Prompt for secrets
echo "📝 Enter your Vercel secrets:"
echo ""

read -sp "VERCEL_TOKEN: " VERCEL_TOKEN
echo ""
read -p "VERCEL_ORG_ID: " VERCEL_ORG_ID
read -p "VERCEL_PROJECT_ID: " VERCEL_PROJECT_ID
echo ""

# Validate inputs
if [ -z "$VERCEL_TOKEN" ] || [ -z "$VERCEL_ORG_ID" ] || [ -z "$VERCEL_PROJECT_ID" ]; then
    echo "❌ All secrets are required"
    exit 1
fi

echo "🚀 Setting GitHub Secrets..."
echo ""

# Set secrets
echo $VERCEL_TOKEN | gh secret set VERCEL_TOKEN --repo $REPO
echo "✅ VERCEL_TOKEN set"

echo $VERCEL_ORG_ID | gh secret set VERCEL_ORG_ID --repo $REPO
echo "✅ VERCEL_ORG_ID set"

echo $VERCEL_PROJECT_ID | gh secret set VERCEL_PROJECT_ID --repo $REPO
echo "✅ VERCEL_PROJECT_ID set"

echo ""
echo "✨ All secrets configured successfully!"
echo ""
echo "🔍 Verify secrets:"
echo "   gh secret list --repo $REPO"
echo ""
echo "🚀 Next steps:"
echo "   1. Push to main branch to trigger deployment"
echo "   2. Monitor at: https://github.com/$REPO/actions"
```

**Usage:**
```bash
chmod +x setup-vercel-secrets.sh
./setup-vercel-secrets.sh
```

---

### Verifying Secrets

```bash
# List all secrets (values are hidden)
gh secret list --repo stackconsult/whispering-salamander-beam

# Expected output:
# VERCEL_TOKEN        Updated 2025-11-12
# VERCEL_ORG_ID       Updated 2025-11-12
# VERCEL_PROJECT_ID   Updated 2025-11-12
```

---

### Updating Secrets

```bash
# Update a secret (same command as setting)
gh secret set VERCEL_TOKEN --repo stackconsult/whispering-salamander-beam
```

---

### Deleting Secrets

```bash
# Delete a specific secret
gh secret delete VERCEL_TOKEN --repo stackconsult/whispering-salamander-beam

# Delete with confirmation
gh secret delete VERCEL_TOKEN --repo stackconsult/whispering-salamander-beam --confirm
```

---

## 5. Vercel CLI Integration

The Vercel CLI provides powerful options for managing deployments and environment variables.

### Installation

```bash
# Global installation
npm i -g vercel

# Or use with npx (no installation)
npx vercel --version
```

### Initial Setup

```bash
# Login to Vercel
vercel login

# Link project to Vercel (creates .vercel/ directory)
cd /path/to/whispering-salamander-beam
vercel link

# Follow prompts:
# - Select scope (team or personal)
# - Link to existing project: whispering-salamander-beam
# - Or create new project
```

This creates `.vercel/project.json`:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

**Important:** Add `.vercel/` to `.gitignore` (already included in this repo)

---

### Manual Deployment via CLI

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy with specific environment
vercel --prod --env ENVIRONMENT=production
```

---

### Environment Variable Management

#### List Environment Variables

```bash
# List all environment variables for the project
vercel env ls

# List for specific environment
vercel env ls production
vercel env ls preview
vercel env ls development
```

#### Add Environment Variables

```bash
# Add interactively
vercel env add LLM_PROVIDER

# You'll be prompted:
# - Enter value
# - Select environments (production, preview, development)

# Add from command line
echo "huggingface" | vercel env add LLM_PROVIDER production

# Add to multiple environments
echo "huggingface" | vercel env add LLM_PROVIDER production preview development
```

#### Add Multiple Variables at Once

```bash
# Option 1: One by one
vercel env add LLM_PROVIDER
vercel env add HUGGINGFACE_API_KEY
vercel env add HUGGINGFACE_MODEL

# Option 2: Script to add all
cat > /tmp/setup-vercel-env.sh << 'EOF'
#!/bin/bash
echo "huggingface" | vercel env add LLM_PROVIDER production preview development
echo "hf_your_key_here" | vercel env add HUGGINGFACE_API_KEY production preview development
echo "mistralai/Mistral-7B-Instruct-v0.2" | vercel env add HUGGINGFACE_MODEL production preview development
EOF

chmod +x /tmp/setup-vercel-env.sh
/tmp/setup-vercel-env.sh
```

#### Pull Environment Variables (for local development)

```bash
# Pull production environment variables to .env.local
vercel env pull .env.local

# Pull from specific environment
vercel env pull .env.development development
vercel env pull .env.production production
```

#### Remove Environment Variables

```bash
# Remove variable
vercel env rm LLM_PROVIDER

# Select environment to remove from
```

---

### Vercel CLI Deployment Workflow

Complete workflow using Vercel CLI:

```bash
#!/bin/bash
# complete-vercel-setup.sh

set -e

echo "🚀 Complete Vercel Setup & Deployment"
echo "======================================"
echo ""

# 1. Install Vercel CLI (if needed)
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel
fi

# 2. Login
echo "🔐 Logging in to Vercel..."
vercel login

# 3. Link project
echo "🔗 Linking project..."
vercel link

# 4. Add environment variables
echo "🌍 Setting up environment variables..."
echo "huggingface" | vercel env add LLM_PROVIDER production preview development
vercel env add HUGGINGFACE_API_KEY production preview development
echo "mistralai/Mistral-7B-Instruct-v0.2" | vercel env add HUGGINGFACE_MODEL production preview development

# 5. Pull env for local development
echo "📥 Pulling environment variables for local development..."
vercel env pull .env.local

# 6. Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo ""
echo "✅ Setup complete!"
echo "📊 View deployment: vercel inspect"
echo "🌐 Visit: vercel --prod"
```

---

### Vercel Project Information

```bash
# View project details
vercel inspect

# Output includes:
# - Project ID
# - Organization ID
# - Git repository
# - Production URL
# - Latest deployment
```

---

### Integration with GitHub Actions

You can use Vercel CLI in GitHub Actions as an alternative to `amondnet/vercel-action`:

```yaml
# Alternative workflow using Vercel CLI
- name: Deploy to Vercel (CLI)
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
    VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  run: |
    npm i -g vercel
    vercel pull --yes --environment=production --token=$VERCEL_TOKEN
    vercel build --prod --token=$VERCEL_TOKEN
    vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
```

---

## 6. Complete Workflow File Configuration

### Fixed Workflow File

Here's the complete, production-ready workflow file with all necessary configurations:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: 8

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      # 1. Checkout code
      - name: Checkout repository
        uses: actions/checkout@v4
      
      # 2. Setup Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      # 3. Setup pnpm
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      
      # 4. Install dependencies
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      # 5. Type checking
      - name: Type check
        run: pnpm run typecheck
        continue-on-error: false
      
      # 6. Linting
      - name: Lint
        run: pnpm run lint
        continue-on-error: false
      
      # 7. Build
      - name: Build application
        run: pnpm run build
        env:
          NODE_ENV: production
      
      # 8. Deploy to Vercel (Production)
      - name: Deploy to Vercel (Production)
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./
      
      # 9. Deploy to Vercel (Preview)
      - name: Deploy to Vercel (Preview)
        if: github.event_name == 'pull_request'
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
      
      # 10. Comment PR with preview URL (for PRs only)
      - name: Comment PR with preview URL
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Preview deployment ready!\n\nCheck out your changes at the preview URL.'
            })
```

### Key Improvements

1. **Environment Variables**: Centralized Node and pnpm versions
2. **Caching**: Enabled pnpm cache for faster builds
3. **Frozen Lockfile**: Ensures consistent dependencies
4. **Conditional Deployment**: 
   - Production: Only on push to main
   - Preview: Only on pull requests
5. **Continue on Error**: Prevents deployment if tests fail
6. **PR Comments**: Automatic preview URL notification
7. **Working Directory**: Explicit path configuration

---

### Alternative: Vercel CLI-based Workflow

For more control, use Vercel CLI directly:

```yaml
name: Deploy to Vercel (CLI)

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Type check
        run: pnpm run typecheck
      
      - name: Lint
        run: pnpm run lint
      
      - name: Install Vercel CLI
        run: npm i -g vercel
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build with Vercel
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Vercel
        run: |
          if [ "${{ github.event_name }}" == "push" ] && [ "${{ github.ref }}" == "refs/heads/main" ]; then
            vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
          else
            vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}
          fi
      
      - name: Get deployment URL
        id: deployment
        run: |
          DEPLOYMENT_URL=$(vercel ls --token=${{ secrets.VERCEL_TOKEN }} | head -n 2 | tail -n 1 | awk '{print $1}')
          echo "url=$DEPLOYMENT_URL" >> $GITHUB_OUTPUT
      
      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Preview: ${{ steps.deployment.outputs.url }}'
            })
```

---

### Workflow for Staging Environment

Add a staging branch deployment:

```yaml
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # ... (same setup as production)
      
      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--target staging'
```

---

## 7. Third-Party Automation Options

For enterprise environments requiring advanced secret management, consider these third-party solutions:

### Option 1: HashiCorp Vault

**Best for:** Enterprise security, dynamic secrets, audit logging

**Features:**
- Centralized secret management
- Dynamic secret generation
- Detailed audit logs
- Role-based access control
- Secret rotation

**Setup:**

1. **Install Vault**
```bash
# macOS
brew tap hashicorp/tap
brew install hashicorp/tap/vault

# Linux
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install vault
```

2. **Initialize Vault**
```bash
# Start Vault server (dev mode for testing)
vault server -dev

# In another terminal, set address
export VAULT_ADDR='http://127.0.0.1:8200'

# Authenticate
vault login <root_token>
```

3. **Store Secrets**
```bash
# Enable KV secrets engine
vault secrets enable -path=vercel kv

# Store Vercel secrets
vault kv put vercel/whispering-salamander-beam \
  token="your_vercel_token" \
  org_id="team_xxxxxxxxxxxxx" \
  project_id="prj_xxxxxxxxxxxxx"
```

4. **GitHub Actions Integration**
```yaml
- name: Import Secrets from Vault
  uses: hashicorp/vault-action@v2
  with:
    url: ${{ secrets.VAULT_ADDR }}
    token: ${{ secrets.VAULT_TOKEN }}
    secrets: |
      vercel/data/whispering-salamander-beam token | VERCEL_TOKEN ;
      vercel/data/whispering-salamander-beam org_id | VERCEL_ORG_ID ;
      vercel/data/whispering-salamander-beam project_id | VERCEL_PROJECT_ID

- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ env.VERCEL_TOKEN }}
    vercel-org-id: ${{ env.VERCEL_ORG_ID }}
    vercel-project-id: ${{ env.VERCEL_PROJECT_ID }}
```

**Resources:**
- Documentation: https://www.vaultproject.io/docs
- GitHub Action: https://github.com/hashicorp/vault-action

---

### Option 2: AWS Secrets Manager

**Best for:** AWS-native infrastructure, automatic rotation, AWS integration

**Features:**
- Automatic secret rotation
- Fine-grained IAM permissions
- Encryption at rest and in transit
- Cross-region replication
- Audit through CloudTrail

**Setup:**

1. **Install AWS CLI**
```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure
aws configure
```

2. **Create Secrets**
```bash
# Create secret for Vercel token
aws secretsmanager create-secret \
  --name vercel/whispering-salamander-beam/token \
  --secret-string "your_vercel_token"

# Create secret for org ID
aws secretsmanager create-secret \
  --name vercel/whispering-salamander-beam/org-id \
  --secret-string "team_xxxxxxxxxxxxx"

# Create secret for project ID
aws secretsmanager create-secret \
  --name vercel/whispering-salamander-beam/project-id \
  --secret-string "prj_xxxxxxxxxxxxx"
```

3. **GitHub Actions Integration**
```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1

- name: Get Secrets from AWS
  run: |
    echo "VERCEL_TOKEN=$(aws secretsmanager get-secret-value --secret-id vercel/whispering-salamander-beam/token --query SecretString --output text)" >> $GITHUB_ENV
    echo "VERCEL_ORG_ID=$(aws secretsmanager get-secret-value --secret-id vercel/whispering-salamander-beam/org-id --query SecretString --output text)" >> $GITHUB_ENV
    echo "VERCEL_PROJECT_ID=$(aws secretsmanager get-secret-value --secret-id vercel/whispering-salamander-beam/project-id --query SecretString --output text)" >> $GITHUB_ENV

- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ env.VERCEL_TOKEN }}
    vercel-org-id: ${{ env.VERCEL_ORG_ID }}
    vercel-project-id: ${{ env.VERCEL_PROJECT_ID }}
```

**Resources:**
- Documentation: https://docs.aws.amazon.com/secretsmanager/
- Pricing: ~$0.40/secret/month + $0.05/10,000 API calls

---

### Option 3: Doppler

**Best for:** Developer-friendly interface, team collaboration, multi-environment

**Features:**
- Intuitive dashboard
- Multi-environment support
- Secret versioning and rollback
- Team permissions
- Native GitHub Actions integration
- Free tier available

**Setup:**

1. **Sign Up**
- Visit: https://doppler.com
- Create account (free tier available)

2. **Install Doppler CLI**
```bash
# macOS
brew install dopplerhq/cli/doppler

# Linux
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sudo sh

# Authenticate
doppler login
```

3. **Setup Project**
```bash
# Create project
doppler projects create whispering-salamander-beam

# Setup environments
doppler environments create production --project whispering-salamander-beam
doppler environments create staging --project whispering-salamander-beam

# Select project and environment
cd /path/to/whispering-salamander-beam
doppler setup --project whispering-salamander-beam --config production
```

4. **Add Secrets**
```bash
# Add secrets via CLI
doppler secrets set VERCEL_TOKEN="your_vercel_token" --project whispering-salamander-beam --config production
doppler secrets set VERCEL_ORG_ID="team_xxxxxxxxxxxxx" --project whispering-salamander-beam --config production
doppler secrets set VERCEL_PROJECT_ID="prj_xxxxxxxxxxxxx" --project whispering-salamander-beam --config production

# Or via dashboard
# https://dashboard.doppler.com
```

5. **GitHub Actions Integration**

```yaml
- name: Install Doppler CLI
  uses: dopplerhq/cli-action@v3

- name: Load Secrets from Doppler
  run: doppler secrets download --no-file --format env-no-quotes >> $GITHUB_ENV
  env:
    DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN }}

- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ env.VERCEL_TOKEN }}
    vercel-org-id: ${{ env.VERCEL_ORG_ID }}
    vercel-project-id: ${{ env.VERCEL_PROJECT_ID }}
```

**Create Doppler Service Token:**
```bash
# Generate token for GitHub Actions
doppler configs tokens create github-actions --project whispering-salamander-beam --config production

# Add to GitHub Secrets
gh secret set DOPPLER_TOKEN --repo stackconsult/whispering-salamander-beam
```

**Resources:**
- Documentation: https://docs.doppler.com
- GitHub Action: https://github.com/DopplerHQ/cli-action
- Pricing: Free for small teams, paid plans available

---

### Comparison Matrix

| Feature | HashiCorp Vault | AWS Secrets Manager | Doppler |
|---------|----------------|---------------------|---------|
| **Ease of Setup** | Complex | Moderate | Simple |
| **Cost** | Free (self-hosted) | ~$0.40/secret/month | Free tier available |
| **UI** | Basic | AWS Console | Excellent |
| **Secret Rotation** | Manual | Automatic | Manual |
| **Audit Logging** | Excellent | Good (CloudTrail) | Good |
| **Multi-Cloud** | Yes | AWS-focused | Yes |
| **Team Collaboration** | Via policies | Via IAM | Built-in |
| **Learning Curve** | Steep | Moderate | Easy |
| **Best For** | Enterprise | AWS users | Developers, startups |

---

### Recommendation

**For this project (Whispering Salamander Beam):**

- **Small Team / Individual**: Use **GitHub Secrets** (simple, free, sufficient)
- **Growing Team**: Use **Doppler** (great UX, team features, free tier)
- **AWS Infrastructure**: Use **AWS Secrets Manager** (native integration)
- **Enterprise / Compliance**: Use **HashiCorp Vault** (maximum security, audit)

**Quick Start Recommendation**: Stick with **GitHub Secrets** + **GitHub CLI** for simplicity.

---

## 8. Verification Checklist

Use this checklist to ensure your deployment is properly configured:

### Pre-Deployment Checklist

- [ ] **Vercel Account Setup**
  - [ ] Vercel account created
  - [ ] Project created in Vercel
  - [ ] Project linked to GitHub repository
  - [ ] Vercel access token generated

- [ ] **GitHub Repository Configuration**
  - [ ] Repository has correct branch (main)
  - [ ] `.github/workflows/deploy.yml` exists
  - [ ] Workflow file has correct syntax

- [ ] **GitHub Secrets Configuration**
  - [ ] `VERCEL_TOKEN` secret added to GitHub
  - [ ] `VERCEL_ORG_ID` secret added to GitHub
  - [ ] `VERCEL_PROJECT_ID` secret added to GitHub
  - [ ] All secrets have correct values (no typos)

- [ ] **Vercel Project Configuration**
  - [ ] `vercel.json` exists in repository root
  - [ ] Build command configured: `pnpm build`
  - [ ] Output directory configured: `dist`
  - [ ] Framework detected: `vite`

- [ ] **Environment Variables (Vercel Dashboard)**
  - [ ] `LLM_PROVIDER` set to `huggingface`
  - [ ] `HUGGINGFACE_API_KEY` configured
  - [ ] `HUGGINGFACE_MODEL` configured
  - [ ] Environment variables set for correct environment (production/preview)

### Verification Commands

Run these commands to verify your setup:

```bash
# 1. Verify GitHub Secrets (requires gh CLI)
gh secret list --repo stackconsult/whispering-salamander-beam

# Expected output:
# VERCEL_TOKEN        Updated YYYY-MM-DD
# VERCEL_ORG_ID       Updated YYYY-MM-DD
# VERCEL_PROJECT_ID   Updated YYYY-MM-DD

# 2. Verify Vercel Project Link
cd /path/to/whispering-salamander-beam
vercel inspect

# Expected: Shows project details including org ID and project ID

# 3. Verify Vercel Environment Variables
vercel env ls

# Expected: Shows all environment variables

# 4. Verify Local Build Works
pnpm install
pnpm run typecheck
pnpm run lint
pnpm run build

# Expected: All commands succeed

# 5. Verify Git Status
git status

# Expected: Working tree clean

# 6. Verify GitHub Actions Workflow
gh workflow list --repo stackconsult/whispering-salamander-beam

# Expected: Shows "Deploy to Vercel" workflow
```

### Post-Deployment Checklist

After pushing to trigger deployment:

- [ ] **GitHub Actions**
  - [ ] Workflow triggered on push
  - [ ] Checkout step succeeds
  - [ ] Node.js setup succeeds
  - [ ] pnpm setup succeeds
  - [ ] Dependencies install successfully
  - [ ] Type check passes
  - [ ] Lint passes
  - [ ] Build completes
  - [ ] Vercel deployment step succeeds

- [ ] **Vercel Dashboard**
  - [ ] New deployment appears in dashboard
  - [ ] Build logs show success
  - [ ] Production URL updated
  - [ ] No build errors

- [ ] **Application Testing**
  - [ ] Production URL loads
  - [ ] Frontend displays correctly
  - [ ] API health endpoint responds: `/api/health`
  - [ ] API validation endpoint works: `/api/validate`
  - [ ] No console errors in browser

### Testing URLs

```bash
# Health Check
curl https://your-project.vercel.app/api/health

# Expected response:
# {
#   "status": "healthy",
#   "provider": "huggingface",
#   "hasApiKey": true,
#   ...
# }

# Validation Test
curl -X POST https://your-project.vercel.app/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "query": "Does this page contain pricing information?"
  }'

# Expected: JSON response with validation results
```

### Automated Verification Script

```bash
#!/bin/bash
# verify-deployment.sh

set -e

REPO="stackconsult/whispering-salamander-beam"
PROJECT_URL="https://your-project.vercel.app"

echo "🔍 Vercel Deployment Verification"
echo "=================================="
echo ""

# Check GitHub Secrets
echo "1️⃣ Checking GitHub Secrets..."
SECRETS=$(gh secret list --repo $REPO | grep -E "(VERCEL_TOKEN|VERCEL_ORG_ID|VERCEL_PROJECT_ID)" | wc -l)
if [ "$SECRETS" -eq 3 ]; then
    echo "   ✅ All 3 secrets configured"
else
    echo "   ❌ Missing secrets (found $SECRETS/3)"
    exit 1
fi

# Check Workflow File
echo "2️⃣ Checking workflow file..."
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "   ✅ Workflow file exists"
else
    echo "   ❌ Workflow file missing"
    exit 1
fi

# Check Local Build
echo "3️⃣ Testing local build..."
if pnpm run build > /dev/null 2>&1; then
    echo "   ✅ Local build succeeds"
else
    echo "   ❌ Local build failed"
    exit 1
fi

# Check Deployment URL
echo "4️⃣ Checking deployment URL..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $PROJECT_URL)
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "   ✅ Deployment accessible (HTTP $HTTP_STATUS)"
else
    echo "   ❌ Deployment not accessible (HTTP $HTTP_STATUS)"
    exit 1
fi

# Check API Health
echo "5️⃣ Checking API health..."
HEALTH_STATUS=$(curl -s "$PROJECT_URL/api/health" | jq -r '.status' 2>/dev/null)
if [ "$HEALTH_STATUS" == "healthy" ]; then
    echo "   ✅ API healthy"
else
    echo "   ⚠️  API health check failed or API not configured"
fi

echo ""
echo "✨ Verification complete!"
```

**Usage:**
```bash
chmod +x verify-deployment.sh
./verify-deployment.sh
```

---

## 9. Build Testing & Troubleshooting

### Local Build Testing

Before deploying, always test locally:

```bash
# 1. Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 2. Type checking
pnpm run typecheck
# Fix any type errors before proceeding

# 3. Linting
pnpm run lint
# Fix any linting errors

# 4. Production build
pnpm run build
# Check for build errors

# 5. Preview production build
pnpm run start
# Visit http://localhost:4173

# 6. Test with Vercel serverless functions
pnpm run dev:vercel
# Visit http://localhost:3000
# Test /api/health and /api/validate
```

---

### Common Issues & Solutions

#### Issue 1: Workflow Fails at Checkout

**Symptom:**
```
Error: The process '/usr/bin/git' failed with exit code 128
```

**Solution:**
```bash
# Verify repository permissions
gh auth status

# Re-authenticate if needed
gh auth login

# Check repository exists
gh repo view stackconsult/whispering-salamander-beam
```

---

#### Issue 2: Missing GitHub Secrets

**Symptom:**
```
Error: Input required and not supplied: vercel-token
```

**Solution:**
```bash
# List current secrets
gh secret list --repo stackconsult/whispering-salamander-beam

# Add missing secret
gh secret set VERCEL_TOKEN --repo stackconsult/whispering-salamander-beam
```

---

#### Issue 3: Vercel Deployment Fails (Invalid Token)

**Symptom:**
```
Error: Invalid token
Error: Vercel deployment failed
```

**Solution:**
```bash
# 1. Verify token is correct (no extra spaces/newlines)
# 2. Generate new token from Vercel dashboard
# 3. Update GitHub secret
echo "new_vercel_token_here" | gh secret set VERCEL_TOKEN --repo stackconsult/whispering-salamander-beam

# 4. Verify token format
# Should start with: vercel_
```

---

#### Issue 4: Wrong Organization or Project ID

**Symptom:**
```
Error: Project not found
Error: Not authorized
```

**Solution:**
```bash
# Get correct IDs from Vercel CLI
vercel link
cat .vercel/project.json

# Update secrets with correct values
echo "team_xxxxxxxxxxxxx" | gh secret set VERCEL_ORG_ID --repo stackconsult/whispering-salamander-beam
echo "prj_xxxxxxxxxxxxx" | gh secret set VERCEL_PROJECT_ID --repo stackconsult/whispering-salamander-beam
```

---

#### Issue 5: Build Fails (Type Errors)

**Symptom:**
```
Error: Type check failed
Error: TS2345: Argument of type 'string' is not assignable to parameter of type 'number'
```

**Solution:**
```bash
# Run type check locally
pnpm run typecheck

# Fix errors in code
# Then commit and push

# If type errors are in dependencies, update TypeScript
pnpm update typescript
```

---

#### Issue 6: Build Fails (Lint Errors)

**Symptom:**
```
Error: ESLint found 5 errors
```

**Solution:**
```bash
# Run lint locally
pnpm run lint

# Auto-fix if possible
# (Note: No auto-fix in this project, fix manually)

# Update workflow to allow warnings (if needed)
# In deploy.yml, add:
# - name: Lint
#   run: pnpm run lint
#   continue-on-error: true  # Only if lint failures are non-critical
```

---

#### Issue 7: Build Succeeds but Deployment Returns 404

**Symptom:**
- Build completes successfully
- Vercel shows deployment success
- But application shows 404

**Solution:**
```bash
# 1. Verify vercel.json configuration
cat vercel.json

# Should have:
# - "outputDirectory": "dist"
# - Correct rewrites for SPA

# 2. Verify build output
pnpm run build
ls -la dist/

# Should contain:
# - index.html
# - assets/
# - api/

# 3. Check Vercel build logs in dashboard
# Look for "Output Directory: dist"
```

---

#### Issue 8: API Endpoints Return 500

**Symptom:**
```bash
curl https://your-project.vercel.app/api/health
# Returns: 500 Internal Server Error
```

**Solution:**
```bash
# 1. Check Vercel function logs in dashboard
# Look for error messages

# 2. Verify environment variables in Vercel
vercel env ls

# 3. Test API locally with Vercel dev
pnpm run dev:vercel
curl http://localhost:3000/api/health

# 4. Check for missing dependencies in api/ folder
# Ensure @vercel/node is installed:
pnpm add -D @vercel/node

# 5. Verify API function structure
cat api/health.ts
# Should export handler function properly
```

---

#### Issue 9: Environment Variables Not Loading

**Symptom:**
- API returns errors about missing env vars
- `/api/health` shows `hasApiKey: false`

**Solution:**
```bash
# 1. Add environment variables in Vercel dashboard
# https://vercel.com/[team]/[project]/settings/environment-variables

# 2. Or via CLI
vercel env add LLM_PROVIDER production
vercel env add HUGGINGFACE_API_KEY production
vercel env add HUGGINGFACE_MODEL production

# 3. Redeploy to pick up new env vars
git commit --allow-empty -m "trigger redeploy"
git push

# Or via Vercel CLI
vercel --prod
```

---

#### Issue 10: GitHub Actions Quota Exceeded

**Symptom:**
```
Error: You have exceeded your GitHub Actions minutes quota
```

**Solution:**
```bash
# 1. Check usage
# Visit: https://github.com/settings/billing

# 2. Optimize workflow
# - Only run on main branch pushes (not all branches)
# - Use conditional deployment steps
# - Cache dependencies more aggressively

# 3. In deploy.yml, ensure:
on:
  push:
    branches: [main]  # Only main, not all branches
```

---

### Debugging Commands

```bash
# View GitHub Actions logs
gh run list --repo stackconsult/whispering-salamander-beam
gh run view <run-id> --repo stackconsult/whispering-salamander-beam

# View Vercel deployment logs
vercel logs <deployment-url>

# Check Vercel project status
vercel inspect

# List recent deployments
vercel ls

# Cancel ongoing deployment
vercel remove <deployment-url>

# View workflow file
gh workflow view "Deploy to Vercel" --repo stackconsult/whispering-salamander-beam

# Re-run failed workflow
gh run rerun <run-id> --repo stackconsult/whispering-salamander-beam
```

---

### Performance Optimization

#### Build Optimization

```yaml
# In deploy.yml, add caching:
- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 8

- name: Get pnpm store directory
  id: pnpm-cache
  run: echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

- name: Setup pnpm cache
  uses: actions/cache@v3
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-store-
```

#### Vercel Build Optimization

```json
// vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "github": {
    "silent": true  // Reduces noise in GitHub checks
  }
}
```

---

### Monitoring & Alerts

#### Setup Vercel Notifications

1. **Via Vercel Dashboard:**
   - Go to Project Settings
   - Navigate to **Notifications**
   - Enable:
     - Deployment succeeded
     - Deployment failed
     - Deployment ready
   - Choose notification channel (Email/Slack)

2. **Via Slack Integration:**
```bash
# Install Vercel Slack app
# Visit: https://vercel.com/integrations/slack

# Configure notifications for your project
```

#### GitHub Actions Notifications

```yaml
# Add to deploy.yml:
- name: Notify on Success
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: success
    text: 'Deployment to Vercel succeeded! 🎉'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

- name: Notify on Failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    text: 'Deployment to Vercel failed! ❌'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

### Testing Checklist

Before marking deployment as complete:

- [ ] Build succeeds locally: `pnpm run build`
- [ ] Type check passes: `pnpm run typecheck`
- [ ] Lint passes: `pnpm run lint`
- [ ] GitHub Actions workflow runs successfully
- [ ] Vercel deployment shows "Ready"
- [ ] Production URL loads correctly
- [ ] Frontend renders without errors
- [ ] API health endpoint responds: `/api/health`
- [ ] API validation endpoint works: `/api/validate`
- [ ] Console shows no errors (F12 → Console)
- [ ] Network requests succeed (F12 → Network)
- [ ] Environment variables loaded correctly
- [ ] Mobile responsive (test on mobile or DevTools)

---

## Quick Reference

### Essential Commands

```bash
# GitHub CLI - Secrets
gh secret set SECRET_NAME --repo OWNER/REPO
gh secret list --repo OWNER/REPO

# Vercel CLI - Deploy
vercel login
vercel link
vercel --prod

# Vercel CLI - Environment Variables
vercel env add VAR_NAME production
vercel env ls
vercel env pull .env.local

# Local Development
pnpm install
pnpm run dev:vercel
pnpm run build
pnpm run typecheck
pnpm run lint

# GitHub Actions
gh workflow list --repo OWNER/REPO
gh run list --repo OWNER/REPO
gh run view RUN_ID --repo OWNER/REPO
```

---

### Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel CLI**: https://vercel.com/docs/cli
- **GitHub Actions**: https://docs.github.com/en/actions
- **GitHub CLI**: https://cli.github.com/manual
- **amondnet/vercel-action**: https://github.com/amondnet/vercel-action

---

## Next Steps

After completing this guide:

1. ✅ Configure all GitHub Secrets
2. ✅ Push to main branch
3. ✅ Monitor GitHub Actions workflow
4. ✅ Verify deployment in Vercel dashboard
5. ✅ Test production deployment
6. 🎉 Enjoy automated deployments!

---

**Document Version:** 1.0.0  
**Last Updated:** November 2025  
**Repository:** [stackconsult/whispering-salamander-beam](https://github.com/stackconsult/whispering-salamander-beam)
