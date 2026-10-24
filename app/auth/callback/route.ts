import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/dashboard";
  if (code) { const supabase = await createClient(); if (!supabase) return NextResponse.redirect(`${origin}/verify-email?error=configuration`); const { error } = await supabase.auth.exchangeCodeForSession(code); if (error) return NextResponse.redirect(`${origin}/verify-email?error=expired`); }
  else return NextResponse.redirect(`${origin}/verify-email?error=missing`);
  return NextResponse.redirect(`${origin}${next}`);
}
