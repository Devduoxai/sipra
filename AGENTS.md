# Sipra Development Rules

## Product

Sipra — "A little something good, every day."

A simple daily positivity service. Users sign up, choose topics they care about, and receive one short, uplifting, personalized message every day by email.

## Branching Strategy

- `master` — production-ready code
- `dev` — integration branch
- `feature/*` — feature branches fork from `dev`
- PRs: `feature/*` → `dev` → `master`

## Development Flow

1. Create feature branch from `dev`
2. Implement story
3. Write/update tests
4. Run full test suite: `pnpm test`
5. Run lint: `pnpm lint`
6. Run typecheck: `pnpm typecheck`
7. Run format check: `pnpm format:check`
8. Review git diff
9. Verify existing features
10. Create pull request

## Commands

```bash
pnpm dev            # Start dev server
pnpm build          # Production build
pnpm test           # Run tests
pnpm test:watch     # Run tests in watch mode
pnpm lint           # Run ESLint
pnpm typecheck      # TypeScript type checking
pnpm format         # Format code with Prettier
pnpm format:check   # Check formatting
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to database
pnpm db:migrate     # Run Prisma migration
```

## Coding Standards

- TypeScript strict mode (always)
- ESLint + Prettier (always)
- Meaningful variable/function names
- Small reusable functions/components
- Clear separation of concerns
- Explicit error handling
- Input validation with Zod
- Secure environment variable handling
- No `any` types
- No hardcoded secrets
- No dead code

## Testing

- Unit tests in `__tests__/`
- Mock external services (AI, email, database)
- Never depend on real external services in tests
- Run all tests before PR

## Security

- Never commit API keys or secrets
- Use environment variables for all configuration
- Validate all server-side input
- Never expose server secrets to the browser
- Include unsubscribe functionality in emails

## AI Message Rules

Messages must be:

- 15-40 words
- Warm, positive, uplifting
- Human sounding, easy to understand
- Relevant to user's selected topics
- Different from recent messages

Messages must NOT:

- Use excessive clichés
- Include fear, guilt, shame, or preaching
- Provide medical, legal, or financial advice
- Use overly dramatic language
- Claim to know personal details unless provided

## Regression Prevention

Before every pull request:

1. Understand existing implementation
2. Identify affected features
3. Run new tests
4. Run ALL existing tests
5. Run lint
6. Run typecheck
7. Review git diff
8. Verify existing features not removed
