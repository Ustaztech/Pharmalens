import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export function isSupabaseConfigured() {
  return getSupabasePublicConfig() !== null;
}

export function createClient() {
  const config = getSupabasePublicConfig();
  if (!config) throw new Error("Supabase is not configured");
  return createBrowserClient(config.url, config.key);
}
