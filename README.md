# Sipra

> "A little something good, every day."

Sipra is a daily positivity email service. Users sign up, pick topics they care about, and receive one AI-generated uplifting message every day.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict)
- **Database:** PostgreSQL (Supabase) + Prisma
- **Email:** Resend
- **AI:** Google Gemini (free tier)
- **Validation:** Zod
- **Testing:** Vitest
- **Styling:** Tailwind CSS
- **Hosting:** Vercel

## Run Locally

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- [pnpm](https://pnpm.io/) 11 or later

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/Devduoxai/sipra.git
   cd sipra
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` and fill in your API keys:

   - `GEMINI_API_KEY` — see [How to get a Gemini API key](#how-to-get-a-gemini-api-key) below
   - `RESEND_API_KEY` — from [Resend](https://resend.com/api-keys)
   - `DATABASE_URL` — your PostgreSQL connection string (e.g. from [Supabase](https://supabase.com))

4. **Set up the database**

   ```bash
   pnpm db:generate
   pnpm db:push
   ```

5. **Start the development server**

   ```bash
   pnpm dev
   ```

6. **Open in browser**

   Visit [http://localhost:3000](http://localhost:3000) to see the landing page.

## How to Get a Gemini API Key

The Gemini API has a **free tier** — no credit card required.

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Create API key"**
4. Copy the key
5. Paste it in `.env.local`:

   ```
   GEMINI_API_KEY=your-key-here
   ```

**Free tier limits:**
- 500 requests/day
- 10 requests/minute
- More than enough for hundreds of users

## Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `pnpm dev`       | Start development server |
| `pnpm build`     | Production build         |
| `pnpm test`      | Run tests                |
| `pnpm lint`      | Run ESLint               |
| `pnpm typecheck` | TypeScript checking      |
| `pnpm format`    | Format with Prettier     |

## Deploy to Vercel

Sipra is a Next.js app, so it deploys to Vercel with zero config.

### 1. Create a Vercel account

1. Go to [vercel.com/signup](https://vercel.com/signup)
2. Click **"Continue with GitHub"** (no credit card needed)

### 2. Import the project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select **"Import Git Repository"**
3. Select `Devduoxai/sipra`
4. Click **"Import"**

### 3. Add environment variables

In the Vercel dashboard, go to **Settings → Environment Variables** and add:

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | Your key from [AI Studio](https://aistudio.google.com/apikey) |
| `RESEND_API_KEY` | Your key from [Resend](https://resend.com/api-keys) |
| `DATABASE_URL` | Your PostgreSQL connection string (e.g. from [Supabase](https://supabase.com)) |

Set each variable for **Production**, **Preview**, and **Development**.

### 4. Deploy

Click **"Deploy"**. Done.

Every push to `master` auto-deploys to production. PRs get preview URLs.

### Free tier

- 100 GB bandwidth/month — enough for thousands of users
- 1M function invocations/month
- 6,000 build minutes/month
- Free tier is for non-commercial use (beta/early stage is fine)

## Project Structure

```
sipra/
├── prisma/          # Database schema
├── src/
│   ├── app/         # Next.js pages and API routes
│   ├── lib/         # Business logic and services
│   └── types/       # TypeScript types
├── __tests__/       # Tests
└── public/          # Static assets
```

## License

Private — Phase 1 Beta
