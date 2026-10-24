import Link from "next/link"; import { AuthPage } from "@/components/auth-page";
import { safeRedirectPath } from "@/lib/navigation";
export const metadata = { title: "Create account" };
export default async function Page({searchParams}:{searchParams:Promise<{next?:string}>}){const {next}=await searchParams;const redirectTo=safeRedirectPath(next);return <AuthPage mode="signup" redirectTo={redirectTo} title="Create your account" description="Save scans securely across devices and track concern reports." alternate={<span>Already have an account? <Link href={`/login?next=${encodeURIComponent(redirectTo)}`}>Log in</Link></span>}/>}
