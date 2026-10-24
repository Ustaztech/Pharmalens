import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "@/components/icons";
import { Logo } from "@/components/logo";
import type { ComponentProps } from "react";

type Props = { mode: ComponentProps<typeof AuthForm>["mode"]; title: string; description: string; alternate: React.ReactNode; redirectTo?: string };
export function AuthPage({ mode, title, description, alternate, redirectTo }: Props) {
  return <main className="auth-page">
    <header className="auth-header">
      <Link href="/" className="auth-back" aria-label="Back to PharmaLens home"><ArrowLeft size={20}/><span>Back</span></Link>
      <Logo/>
      <span className="auth-header-spacer" aria-hidden="true"/>
    </header>
    <div className="auth-shell">
      <div className="auth-intro">
        <span className="auth-icon" aria-hidden="true"><LockKeyhole size={24}/></span>
        <span className="eyebrow">Secure account access</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <section className="auth-card card">
        <AuthForm mode={mode} redirectTo={redirectTo}/>
        <div className="auth-alternate">{alternate}</div>
        <div className="auth-privacy"><ShieldCheck size={16}/><span>Protected by Supabase Auth and row-level access controls. Guest scans are never uploaded automatically.</span></div>
      </section>
      <Link href="/scan" className="auth-guest"><span>Continue without an account</span><small>Use a device-only guest scan</small></Link>
    </div>
  </main>;
}
