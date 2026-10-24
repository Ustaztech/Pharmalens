"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole } from "@/components/icons";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { authSchema } from "@/lib/validation";

type Mode = "login" | "signup" | "forgot" | "reset";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [visible, setVisible] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const configured = isSupabaseConfigured();
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    if (!configured) { setError("Account services are not configured in this local environment. You can continue as a guest."); return; }
    if (mode !== "forgot") { const result = authSchema.safeParse({ email, password }); if (!result.success) { setError(result.error.issues[0].message); return; } }
    setBusy(true); const supabase = createClient();
    try {
      if (mode === "login") { const { error: authError } = await supabase.auth.signInWithPassword({ email, password }); if (authError) throw authError; router.push("/dashboard"); router.refresh(); }
      if (mode === "signup") { const { error: authError } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/auth/callback` } }); if (authError) throw authError; router.push(`/verify-email?email=${encodeURIComponent(email)}`); }
      if (mode === "forgot") { const parsed = authSchema.pick({ email: true }).safeParse({ email }); if (!parsed.success) throw new Error(parsed.error.issues[0].message); const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/reset-password` }); if (authError) throw authError; setMessage("If the account exists, a secure reset link has been sent."); }
      if (mode === "reset") { const { error: authError } = await supabase.auth.updateUser({ password }); if (authError) throw authError; setMessage("Password updated. You can now continue to your dashboard."); }
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong. Please try again."); } finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="auth-form" noValidate>{mode !== "reset" && <div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div>}{mode !== "forgot" && <div className="field"><label htmlFor="password">{mode === "reset" ? "New password" : "Password"}</label><div className="password-field"><input id="password" type={visible ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></div>}{error && <div role="alert" className="form-alert error">{error}</div>}{message && <div role="status" className="form-alert success">{message}</div>}<button disabled={busy} className="button button-primary full" type="submit"><LockKeyhole size={18} />{busy ? "Please wait…" : mode === "login" ? "Log in securely" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Update password"}</button></form>;
}
