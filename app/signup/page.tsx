import Link from "next/link"; import { AuthPage } from "@/components/auth-page";
export const metadata = { title: "Create account" };
export default function Page(){return <AuthPage mode="signup" title="Create your account" description="Save scans securely across devices and track concern reports." alternate={<span>Already have an account? <Link href="/login">Log in</Link></span>}/>}
