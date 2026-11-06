function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Check your .env.local file or Vercel environment settings.`,
    );
  }
  return value;
}

export const env = {
  get ANTHROPIC_API_KEY() {
    return requireEnv("ANTHROPIC_API_KEY");
  },
};
