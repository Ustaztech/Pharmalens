import Link from "next/link"; import { Logo } from "@/components/logo"; import { VerifyEmail } from "@/components/verify-email";
export const metadata={title:"Verify your email"};
export default async function Page({searchParams}:{searchParams:Promise<{email?:string;error?:string}>}){const params=await searchParams;return <main className="auth-page"><Link href="/"><Logo/></Link><VerifyEmail email={params.email??""} error={params.error}/></main>}
