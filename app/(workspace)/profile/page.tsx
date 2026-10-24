import { PageHeader } from "@/components/page-header"; import { ProfileClient } from "@/components/profile-client";
export const metadata={title:"Profile"}; export default function Page(){return <><PageHeader eyebrow="Account and privacy" title="Your profile" description="Review session status and control retained PharmaLens data."/><ProfileClient/></>}
