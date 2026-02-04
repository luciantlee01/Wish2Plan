# Wish2Plan

A production-ready MVP web app for aggregating and organizing date ideas. Save ideas from URLs, organize them on a map, and create plans with calendar export.

## Features

- **Authentication**: Sign in with GitHub OAuth (Google optional)
- **Idea Management**: Save ideas by pasting URLs or text, with automatic metadata extraction
- **Smart URL Processing**: Extracts metadata from TikTok (oEmbed), Instagram, and other sites
- **Location Mapping**: Geocode places and visualize ideas on an interactive Mapbox map
- **Plan Creation**: Create date plans with multiple ideas and export to .ics calendar files
- **Modern UI**: Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui components

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth.js (Auth.js)
- **Database**: PostgreSQL with Prisma ORM
- **Maps**: Mapbox GL JS
- **Deployment**: Vercel

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (local or remote)
- GitHub OAuth App credentials
- Mapbox account and access token

### Step 1: Clone and Install

```bash
# If starting from scratch, create a new Next.js app:
npx create-next-app@latest wish2plan --typescript --tailwind --app

# Navigate to the project
cd wish2plan

# Install dependencies
npm install
```

### Step 2: Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the required environment variables:

```env
# NextAuth
AUTH_SECRET=your-secret-here  # Generate with: openssl rand -base64 32
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# Optional: Google OAuth
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Database (PostgreSQL)
POSTGRES_PRISMA_URL=postgresql://user:password@localhost:5432/wish2plan
POSTGRES_URL_NON_POOLING=postgresql://user:password@localhost:5432/wish2plan

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-public-token
MAPBOX_TOKEN=your-mapbox-server-token
```

### Step 3: Set Up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Wish2Plan (or your choice)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env.local`

### Step 4: Set Up Mapbox

1. Create an account at [Mapbox](https://www.mapbox.com/)
2. Go to your [Account Tokens](https://account.mapbox.com/access-tokens/)
3. Create a token with the following scopes:
   - `styles:read`
   - `fonts:read`
   - `geocoding:read`
4. Use the same token for both `NEXT_PUBLIC_MAPBOX_TOKEN` and `MAPBOX_TOKEN`

### Step 5: Set Up Database

#### Option A: Local PostgreSQL

```bash
# Create database
createdb wish2plan

# Or using psql:
psql -U postgres
CREATE DATABASE wish2plan;
```

#### Option B: Use a Cloud Provider

- [Supabase](https://supabase.com/) (free tier available)
- [Neon](https://neon.tech/) (free tier available)
- [Railway](https://railway.app/) (free tier available)

Copy the connection string to your `.env.local`.

### Step 6: Run Prisma Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or create a migration (for production)
npm run db:migrate
```

### Step 7: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Vercel Deployment

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### Step 2: Create Vercel Project

1. Go to [Vercel](https://vercel.com/) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### Step 3: Set Up Vercel Postgres

1. In your Vercel project dashboard, go to the "Storage" tab
2. Click "Create Database" → "Postgres"
3. Create a new database
4. Vercel will automatically add the connection strings to your environment variables

### Step 4: Pull Environment Variables

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables (includes database URLs)
vercel env pull .env.local
```

### Step 5: Add Remaining Environment Variables

In the Vercel dashboard, go to Settings → Environment Variables and add:

- `AUTH_SECRET` (generate with: `openssl rand -base64 32`)
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `AUTH_GOOGLE_ID` (optional)
- `AUTH_GOOGLE_SECRET` (optional)
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `MAPBOX_TOKEN`

### Step 6: Update GitHub OAuth Callback URL

Update your GitHub OAuth App's callback URL to:
```
https://your-vercel-app.vercel.app/api/auth/callback/github
```

### Step 7: Run Prisma Migrations on Vercel

```bash
# Set the database URL from Vercel
export POSTGRES_PRISMA_URL="your-vercel-postgres-url"

# Run migrations
npm run db:migrate

# Or use Vercel's built-in migration support
# Add to package.json scripts:
# "postinstall": "prisma generate && prisma migrate deploy"
```

Alternatively, you can run migrations via Vercel's CLI:

```bash
vercel env pull .env.local
npm run db:migrate
```

### Step 8: Deploy

```bash
# Deploy to production
vercel --prod
```

Or push to your main branch if you have automatic deployments enabled.

## Project Structure

```
wish2plan/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth routes
│   │   ├── ingest/       # URL ingestion endpoint
│   │   ├── ideas/        # Idea CRUD
│   │   ├── geocode/      # Mapbox geocoding
│   │   └── plans/        # Plan management
│   ├── app/              # Protected app pages
│   │   ├── ideas/        # Ideas list and detail
│   │   ├── map/          # Map view
│   │   └── plans/        # Plans list and detail
│   ├── login/            # Login page
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # shadcn/ui components
│   └── app-sidebar.tsx   # Navigation sidebar
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   ├── geocode.ts        # Mapbox geocoding utilities
│   ├── metadata.ts       # URL metadata extraction
│   ├── utils.ts          # Utility functions
│   └── validation.ts     # Zod schemas
├── prisma/
│   └── schema.prisma     # Database schema
└── middleware.ts         # Auth middleware
```

## Key Features Implementation

### URL Ingestion

The `/api/ingest` endpoint:
- Extracts URLs from text using regex
- Identifies source (TikTok, Instagram, Other)
- Fetches metadata via oEmbed (TikTok) or OpenGraph parsing
- Returns draft ideas ready to be saved

### Metadata Extraction

- **TikTok**: Uses oEmbed API first, falls back to OpenGraph
- **Other URLs**: Parses OpenGraph tags from HTML
- Gracefully handles errors and missing metadata

### Geocoding

- Uses Mapbox Geocoding API
- Searches places as user types (debounced)
- Attaches coordinates to ideas for map visualization

### Map View

- Interactive Mapbox map with custom markers
- Filters by category and status
- Click markers to view idea details
- Auto-fits bounds to show all ideas

### Plan Export

- Generates .ics calendar files using the `ics` library
- Includes plan title, date/time, notes, and idea titles
- Downloads directly to user's device

## Troubleshooting

### Database Connection Issues

- Verify your `POSTGRES_PRISMA_URL` is correct
- Check that your database is accessible
- Ensure Prisma migrations have run: `npm run db:push`

### Authentication Issues

- Verify `AUTH_SECRET` is set (required for NextAuth)
- Check GitHub OAuth callback URL matches your deployment URL
- Ensure environment variables are set in Vercel dashboard

### Mapbox Not Loading

- Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set
- Check token has required scopes
- Ensure token is not expired

### Metadata Extraction Failing

- Some sites may block automated requests
- TikTok oEmbed may require specific URL formats
- Check browser console and server logs for errors

## License

MIT

