import Link from "next/link"; import { AuthPage } from "@/components/auth-page";
export const metadata = { title: "Log in" };
export default function Page(){return <AuthPage mode="login" title="Welcome back" description="Access your saved scans and report tracking." alternate={<><Link href="/forgot-password">Forgot password?</Link><span>New here? <Link href="/signup">Create an account</Link></span></>}/>}
