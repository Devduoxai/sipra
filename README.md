# Sipra

> "A little something good, every day."

Sipra is a daily positivity email service. Users sign up, pick topics they care about, and receive one AI-generated uplifting message every day.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict)
- **Database:** PostgreSQL (Supabase) + Prisma
- **Email:** Resend
- **AI:** OpenAI (GPT-4o-mini)
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

   - `OPENAI_API_KEY` — from [OpenAI](https://platform.openai.com/api-keys)
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
