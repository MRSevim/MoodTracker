export const routes = {
  homepage: "/",
  about: "/about",
  dashboard: "/dashboard",
  settings: "/settings",
  signIn: "/sign-in",
  moodEntry: "/mood-entry",
};

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
  AUTH_SECRET: requiredEnv("AUTH_SECRET"),
  AUTH_GOOGLE_ID: requiredEnv("AUTH_GOOGLE_ID"),
  AUTH_GOOGLE_SECRET: requiredEnv("AUTH_GOOGLE_SECRET"),
};
