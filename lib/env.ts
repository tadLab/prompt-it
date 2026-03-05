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
  get FIREBASE_PROJECT_ID() { return requireEnv("FIREBASE_PROJECT_ID"); },
  get FIREBASE_CLIENT_EMAIL() { return requireEnv("FIREBASE_CLIENT_EMAIL"); },
  get FIREBASE_PRIVATE_KEY() { return requireEnv("FIREBASE_PRIVATE_KEY"); },
  get NEXT_PUBLIC_APP_URL() { return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"; },
};
