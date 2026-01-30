import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (
      process.env.NODE_ENV === "production" &&
      typeof window !== "undefined"
    ) {
      console.error("Supabase environment variables are missing!");
    }
    // Return a dummy or throw, but for build safety, maybe just use empty string if we can't help it?
    // Actually, throwing here nicely is better than crashing deep inside the library.
    // However, during build time, if this is called, we don't want to crash.
    return createBrowserClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseAnonKey || "placeholder",
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
