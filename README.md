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

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Set up database:

   ```bash
   pnpm db:generate
   pnpm db:push
   ```

4. Start dev server:
   ```bash
   pnpm dev
   ```

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
spira/
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
