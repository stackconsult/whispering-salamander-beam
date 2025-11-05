# GitHub & Vercel Integration Setup

## Quick Setup Steps

### 1. Create GitHub Repository

Visit: https://github.com/new

Repository settings:
- **Name**: `whispering-salamander-beam`
- **Visibility**: Public or Private (your choice)
- **Do NOT initialize** with README, .gitignore, or license (we already have these)

### 2. Push to GitHub

After creating the repository, run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/whispering-salamander-beam.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 3. Connect Vercel to GitHub

#### Option A: Automatic (Recommended)
1. Go to https://vercel.com/dashboard
2. Navigate to your project: `whispering-salamander-beam`
3. Go to **Settings** → **Git**
4. Click **Connect Git Repository**
5. Select your GitHub repository
6. Vercel will automatically deploy on every push to `main`

#### Option B: Using GitHub Actions
1. Get your Vercel token: https://vercel.com/account/tokens
2. Add these secrets to your GitHub repository:
   - Go to: `https://github.com/YOUR_USERNAME/whispering-salamander-beam/settings/secrets/actions`
   - Add secret: `VERCEL_TOKEN` (from step 1)
   - Add secret: `VERCEL_ORG_ID` = `team_SumxDwTR4D1VW54w6KpJo4Hs`
   - Add secret: `VERCEL_PROJECT_ID` = `prj_lAsqpuqLAHdcPgZzunn5ERmCE9o9`

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
- Run type checks
- Run linting
- Build the project
- Deploy to Vercel on every push to `main`

## Vercel Project Details

- **Project ID**: `prj_lAsqpuqLAHdcPgZzunn5ERmCE9o9`
- **Org ID**: `team_SumxDwTR4D1VW54w6KpJo4Hs`
- **Project Name**: `whispering-salamander-beam`
- **Current URL**: https://whispering-salamander-beam-k4ivmyy6o-kirtis-projects-e4667d39.vercel.app

## Environment Variables Already Configured

The following environment variables are already set in Vercel:
- `HUGGINGFACE_API_KEY`
- `LLM_PROVIDER` = `huggingface`
- `HUGGINGFACE_MODEL` = `mistralai/Mistral-7B-Instruct-v0.2`

These will automatically be available to your deployed application.

## Post-Setup Verification

After connecting GitHub and Vercel:

1. Make a small change and push:
```bash
git add .
git commit -m "test: Verify GitHub-Vercel integration"
git push
```

2. Check deployment:
   - Vercel Dashboard: https://vercel.com/dashboard
   - GitHub Actions: `https://github.com/YOUR_USERNAME/whispering-salamander-beam/actions`

3. Test API endpoints:
```bash
curl https://your-app.vercel.app/api/health
```

## Continuous Deployment Flow

Once connected:
1. Make changes locally
2. Commit: `git commit -m "feat: Your feature"`
3. Push: `git push`
4. Vercel automatically deploys to production
5. New URL available within ~2 minutes

## Troubleshooting

### If push fails
- Ensure you have write access to the GitHub repository
- Check if you need to authenticate: `git config credential.helper`

### If Vercel doesn't auto-deploy
- Verify the GitHub integration in Vercel settings
- Check that the repository branch matches (should be `main`)
- Ensure Vercel has permission to access your GitHub repository

### If deployment fails
- Check build logs in Vercel Dashboard
- Verify all environment variables are set
- Run `pnpm run typecheck && pnpm run build` locally first
