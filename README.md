# Sipra

> "A little something good, every day."

Sipra is a daily positivity email service. Users sign up, pick topics they care about, and receive one AI-generated uplifting message every day.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict)
- **Database:** PostgreSQL (Supabase) + Prisma
- **Email:** Resend
- **AI:** Gemini 2.0 Flash (free tier)
- **Validation:** Zod
- **Testing:** Vitest
- **Styling:** Tailwind CSS

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

   - `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/apikey) (free tier)
   - `RESEND_API_KEY` — from [Resend](https://resend.com/api-keys)
   - `ADMIN_KEY` — your admin dashboard key (any string)
   - `CRON_SECRET` — secret for Vercel cron job authentication
   - `NEXT_PUBLIC_APP_URL` — your app URL (e.g. `https://sipra.vercel.app`)

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

## Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `pnpm dev`       | Start development server |
| `pnpm build`     | Production build         |
| `pnpm test`      | Run tests                |
| `pnpm lint`      | Run ESLint               |
| `pnpm typecheck` | TypeScript checking      |
| `pnpm format`    | Format with Prettier     |

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

## Supabase Setup (Production Database)

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click "New Project"
   - Name: `sipra`
   - Database password: save this somewhere
   - Region: pick closest to your users
3. Go to **Settings → Database**
4. Under "Connection string", click "URI" and copy the URL
5. Format: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
6. Use this as your `DATABASE_URL` in Vercel environment variables

## Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel` (from sipra directory)
4. Go to Vercel Dashboard → Project → Settings → Environment Variables
5. Add these variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase PostgreSQL URL |
| `RESEND_API_KEY` | Your Resend API key |
| `GEMINI_API_KEY` | Your Gemini API key |
| `ADMIN_KEY` | Any secret string for admin dashboard |
| `CRON_SECRET` | Any random string for cron auth |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL (e.g. `https://sipra.vercel.app`) |

6. Update `prisma/schema.prisma` — change `provider = "sqlite"` to `provider = "postgresql"`
7. Push schema: `DATABASE_URL="your-url" pnpm db:push`
8. Redeploy: `vercel --prod`

## Cron Job

Messages are sent once daily at **1:00 PM UTC (7:00 AM CST/CDT)**.

Users receive messages based on their chosen `deliveryTime` preference.
