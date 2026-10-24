import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";
import type { ComponentProps } from "react";

type Props = { mode: ComponentProps<typeof AuthForm>["mode"]; title: string; description: string; alternate: React.ReactNode; redirectTo?: string };
export function AuthPage({ mode, title, description, alternate, redirectTo }: Props) { return <main className="auth-page"><Link href="/"><Logo /></Link><section className="auth-card card"><span className="eyebrow">Secure account access</span><h1>{title}</h1><p>{description}</p><AuthForm mode={mode} redirectTo={redirectTo}/><div className="auth-alternate">{alternate}</div><div className="auth-privacy">Authentication is handled by Supabase Auth. Account data is protected by server-enforced row-level access rules, and guest scans are never automatically uploaded.</div></section><Link href="/scan" className="text-link">Continue with a device-only guest scan</Link></main>; }
