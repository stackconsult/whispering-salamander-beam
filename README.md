# Whispering Salamander Beam

**AI-Powered Source Validator** with Hugging Face Integration

A React + Vite application featuring serverless API integration with interchangeable LLM providers (Hugging Face & OpenAI) for intelligent content validation.

## 🚀 Live Deployment

- **Production**: https://whispering-salamander-beam-k4ivmyy6o-kirtis-projects-e4667d39.vercel.app
- **GitHub**: https://github.com/stackconsult/whispering-salamander-beam
- **Vercel Dashboard**: https://vercel.com/stackconsult/whispering-salamander-beam

## 🎯 Features

- ✅ **Serverless API** - Vercel edge functions with TypeScript
- ✅ **Dual LLM Providers** - Switch between Hugging Face & OpenAI
- ✅ **Rate Limiting** - 10 requests/minute per IP
- ✅ **React + Vite** - Fast development with HMR
- ✅ **shadcn/ui Components** - Beautiful, accessible UI
- ✅ **TypeScript** - Full type safety across frontend & backend
- ✅ **Automated Deployment** - GitHub → Vercel CI/CD

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite 6.3.4
- Tailwind CSS 3.4.x
- shadcn/ui (Radix primitives)
- React Query for data fetching
- React Hook Form + Zod validation

**Backend:**
- Vercel Serverless Functions
- Hugging Face Inference API (Mistral-7B)
- OpenAI GPT-4o-mini (optional)
- In-memory rate limiting

## 📦 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run with Vercel serverless functions
pnpm dev:vercel

# Build for production
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## 🔧 Environment Variables

Create `.env.local`:

```bash
LLM_PROVIDER=huggingface
HUGGINGFACE_API_KEY=your_hf_key_here
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2

# Optional: OpenAI
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4o-mini
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_REPORT.md) - Full deployment documentation
- [GitHub Setup](./GITHUB_SETUP.md) - GitHub & Vercel integration guide
- [AI Guidelines](./.github/copilot-instructions.md) - AI agent instructions

## 🧪 API Endpoints

**Health Check:**
```bash
curl https://your-app.vercel.app/api/health
```

**Validate Content:**
```bash
curl -X POST https://your-app.vercel.app/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "query": "Does this page contain pricing information?"
  }'
```

## 🔄 Deployment Pipeline

Every push to `main` automatically:
1. Runs TypeScript checks
2. Runs ESLint
3. Builds the application
4. Deploys to Vercel production

## 📄 License

Built with [Dyad](https://dyad.sh) 🚀
