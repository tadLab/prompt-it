function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Check your .env.local file or Vercel environment settings.`
    );
  }
  return value;
}

export const env = {
  get ANTHROPIC_API_KEY() { return requireEnv("ANTHROPIC_API_KEY"); },
  get SUPABASE_SERVICE_ROLE_KEY() { return requireEnv("SUPABASE_SERVICE_ROLE_KEY"); },
  get STRIPE_SECRET_KEY() { return requireEnv("STRIPE_SECRET_KEY"); },
  get STRIPE_WEBHOOK_SECRET() { return requireEnv("STRIPE_WEBHOOK_SECRET"); },
  get STRIPE_PRICE_STARTER() { return requireEnv("STRIPE_PRICE_STARTER"); },
  get STRIPE_PRICE_PRO() { return requireEnv("STRIPE_PRICE_PRO"); },
  get STRIPE_PRICE_POWER() { return requireEnv("STRIPE_PRICE_POWER"); },
  get NEXT_PUBLIC_SUPABASE_URL() { return requireEnv("NEXT_PUBLIC_SUPABASE_URL"); },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() { return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"); },
  get NEXT_PUBLIC_APP_URL() { return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"; },
};
