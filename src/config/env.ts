type AiProvider = "none" | "claude";

const aiProvider = (process.env.NEXT_PUBLIC_AI_PROVIDER ?? "none") as AiProvider;

const env = {
  aiProvider,
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  },
  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    model: process.env.CLAUDE_MODEL ?? "claude-haiku-4-5-20251001",
  },
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

if (env.aiProvider !== "none" && env.aiProvider !== "claude") {
  throw new Error("AI_PROVIDER must be 'none' or 'claude'");
}

if (!env.supabase.url) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!env.supabase.anonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
}

if (env.aiProvider === "claude" && typeof window === "undefined" && !env.claude.apiKey) {
  throw new Error("Missing ANTHROPIC_API_KEY environment variable");
}

export default env;
