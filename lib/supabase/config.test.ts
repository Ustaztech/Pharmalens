import { afterEach, describe, expect, it } from "vitest";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

afterEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
});

describe("Supabase public configuration", () => {
  it("rejects placeholders and malformed URLs", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://your-project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "your-anon-key";
    expect(getSupabasePublicConfig()).toBeNull();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "not-a-url";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "publishable-key";
    expect(getSupabasePublicConfig()).toBeNull();
  });

  it("returns a valid configured project", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "publishable-key";
    expect(getSupabasePublicConfig()).toEqual({ url: "https://example.supabase.co", key: "publishable-key" });
  });
});
