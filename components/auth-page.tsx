import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/logo";
import type { ComponentProps } from "react";

type Props = { mode: ComponentProps<typeof AuthForm>["mode"]; title: string; description: string; alternate: React.ReactNode };
export function AuthPage({ mode, title, description, alternate }: Props) { return <main className="auth-page"><Link href="/"><Logo /></Link><section className="auth-card card"><span className="eyebrow">Secure account access</span><h1>{title}</h1><p>{description}</p><AuthForm mode={mode} /><div className="auth-alternate">{alternate}</div><div className="auth-privacy">Your account data is protected by row-level access rules. Guest scans are never automatically uploaded.</div></section><Link href="/scan" className="text-link">Continue with a device-only guest scan</Link></main>; }
