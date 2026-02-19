# FederatedPrompts

A full-stack application combining:
- **Cloudflare Workers** - Serverless backend API
- **Node.js/TypeScript** - Backend logic
- **React Frontend** - Interactive UI
- **Cloudflare D1/KV** - Database and caching

## Project Structure

```
├── src/                    # Cloudflare Worker + Backend
│   ├── index.ts           # Main Worker entry point
│   ├── api/               # API route handlers
│   ├── middleware/        # Request/response middleware
│   └── utils/             # Shared utilities
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Frontend utilities
│   │   └── styles/        # CSS/styling
│   ├── public/            # Static assets
│   └── vite.config.ts     # Vite configuration
├── public/                # Assets served by Worker
├── tests/                 # Test files
├── wrangler.jsonc         # Cloudflare Workers config
├── tsconfig.json          # TypeScript config
└── package.json           # Dependencies
```

## Getting Started

### Prerequisites
- Node.js 18+
- Wrangler CLI (`npm install -g @cloudflare/wrangler`)

### Development

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Start Cloudflare Worker dev server (runs on :8787)
npm run dev

# In another terminal, start frontend dev server (runs on :5173)
cd frontend && npm run dev

# Run tests
npm test

# Generate Cloudflare types
npm run cf-typegen
```

### Build

```bash
# Build frontend for production
cd frontend && npm run build && cd ..

# This will output to ./public directory
```

### Deployment

```bash
# Deploy to Cloudflare Workers (includes built frontend assets)
npm run deploy
```

## Configuration

- **wrangler.jsonc** - Worker configuration, bindings, and assets
- **tsconfig.json** - TypeScript compiler options
- **vitest.config.mts** - Test runner configuration
- **frontend/vite.config.ts** - Vite frontend build configuration

## Environment Variables

Create a `.env.local` file for local development:

```
# API Configuration
API_BASE_URL=http://localhost:8787
```

Use Wrangler secrets for production:

```bash
wrangler secret put MY_SECRET
```

## Available Scripts

### Root (Backend/Worker)
- `npm run dev` - Start Cloudflare Worker dev server
- `npm run deploy` - Deploy to production
- `npm test` - Run tests
- `npm run cf-typegen` - Generate Cloudflare type definitions

### Frontend
- `npm run dev` - Start dev server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Endpoints

- `GET /health` - Health check
- `GET /api/health` - API health check

## Development Workflow

1. Start the Worker dev server: `npm run dev`
2. In another terminal, start frontend: `cd frontend && npm run dev`
3. Frontend runs on http://localhost:5173
4. Worker API runs on http://localhost:8787
5. Frontend proxies API calls from `/api/*` to the Worker

## Deployment

The Worker serves both the API and static frontend assets:

```bash
# Build frontend production assets
cd frontend && npm run build && cd ..

# Deploy everything to Cloudflare
npm run deploy
```

Visit your deployed site at your Cloudflare Workers URL.
