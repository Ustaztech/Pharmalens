import Link from "next/link"; import { AuthPage } from "@/components/auth-page";
export const metadata = { title: "Reset password" };
export default function Page(){return <AuthPage mode="forgot" title="Reset your password" description="We will send a secure recovery link to your verified email." alternate={<Link href="/login">Return to log in</Link>}/>}
