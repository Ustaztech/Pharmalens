import Link from "next/link"; import { AuthPage } from "@/components/auth-page";
export const metadata = { title: "Choose a new password" };
export default function Page(){return <AuthPage mode="reset" title="Choose a new password" description="Use at least eight characters and avoid a password used elsewhere." alternate={<Link href="/login">Return to log in</Link>}/>}
