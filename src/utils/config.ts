import "server-only";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: requiredEnv("NODE_ENV"),
  DATABASE_URL: requiredEnv("DATABASE_URL"),
  BETTER_AUTH_SECRET: requiredEnv("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: requiredEnv("BETTER_AUTH_URL"),
  AUTH_GOOGLE_ID: requiredEnv("AUTH_GOOGLE_ID"),
  AUTH_GOOGLE_SECRET: requiredEnv("AUTH_GOOGLE_SECRET"),
};
