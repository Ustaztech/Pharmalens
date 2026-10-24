"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole } from "@/components/icons";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { authSchema, passwordSchema } from "@/lib/validation";
import { safeRedirectPath } from "@/lib/navigation";

export type AuthMode = "login" | "signup" | "forgot" | "reset";

export function AuthForm({ mode, redirectTo = "/dashboard" }: { mode: AuthMode; redirectTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const configured = isSupabaseConfigured();
  const safeRedirect = safeRedirectPath(redirectTo);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!configured) {
      setError("Account services are not configured in this environment. Add valid Supabase credentials or continue as a guest.");
      return;
    }

    const credentials = mode === "reset" ? passwordSchema.safeParse(password) : mode === "forgot" ? authSchema.pick({ email: true }).safeParse({ email }) : authSchema.safeParse({ email, password });
    if (!credentials.success) {
      setError(credentials.error.issues[0].message);
      return;
    }
    if (mode === "signup" && !accepted) {
      setError("Accept the Terms and Privacy Notice to create an account.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    try {
      if (mode === "login") {
        const parsed = authSchema.parse({ email, password });
        const { error: authError } = await supabase.auth.signInWithPassword(parsed);
        if (authError) throw authError;
        router.replace(safeRedirect);
        router.refresh();
      } else if (mode === "signup") {
        const parsed = authSchema.parse({ email, password });
        const callback = `${location.origin}/auth/callback?next=${encodeURIComponent(safeRedirect)}`;
        const { data, error: authError } = await supabase.auth.signUp({ ...parsed, options: { emailRedirectTo: callback } });
        if (authError) throw authError;
        if (data.session) {
          router.replace(safeRedirect);
          router.refresh();
        } else {
          router.push(`/verify-email?email=${encodeURIComponent(parsed.email)}`);
        }
      } else if (mode === "forgot") {
        const parsed = authSchema.pick({ email: true }).parse({ email });
        const callback = `${location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`;
        const { error: authError } = await supabase.auth.resetPasswordForEmail(parsed.email, { redirectTo: callback });
        if (authError) throw authError;
        setMessage("If the account exists, a secure reset link has been sent.");
      } else {
        const parsedPassword = passwordSchema.parse(password);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("This recovery session is missing or expired. Request a new password-reset email.");
        const { error: authError } = await supabase.auth.updateUser({ password: parsedPassword });
        if (authError) throw authError;
        setMessage("Password updated. Redirecting to your dashboard…");
        window.setTimeout(() => { router.replace("/dashboard"); router.refresh(); }, 700);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication could not be completed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="auth-form" noValidate aria-busy={busy}>
    {mode !== "reset" && <div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required disabled={busy}/></div>}
    {mode !== "forgot" && <div className="field"><label htmlFor="password">{mode === "reset" ? "New password" : "Password"}</label><div className="password-field"><input id="password" type={visible ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" minLength={8} maxLength={72} required disabled={busy}/><button type="button" onClick={() => setVisible(current => !current)} aria-label={visible ? "Hide password" : "Show password"} disabled={busy}>{visible ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div></div>}
    {mode === "signup" && <label className="consent auth-consent"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} disabled={busy}/><span><strong>I accept the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Notice</Link>.</strong><small>Account records are private. Package images require separate retention consent during scanning.</small></span></label>}
    {error && <div role="alert" className="form-alert error">{error}</div>}
    {message && <div role="status" className="form-alert success">{message}</div>}
    <button disabled={busy} className="button button-primary full" type="submit"><LockKeyhole size={18}/>{busy ? <><span className="button-spinner" aria-hidden="true"/>Please wait…</> : mode === "login" ? "Log in securely" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Update password"}</button>
  </form>;
}
