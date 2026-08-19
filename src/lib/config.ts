function getEnv(name: string, required = true): string {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const config = {
  databaseUrl: getEnv("DATABASE_URL"),
  resendApiKey: getEnv("RESEND_API_KEY"),
  geminiApiKey: getEnv("GEMINI_API_KEY"),
  cronSecret: getEnv("CRON_SECRET", false),
  appUrl: getEnv("NEXT_PUBLIC_APP_URL", false) || "http://localhost:3000",
} as const;
