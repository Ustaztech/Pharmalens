import Link from "next/link"; import { CircleHelp } from "@/components/icons"; import { PageHeader } from "@/components/page-header";
export const metadata={title:"Help and FAQs"};
const faqs=[
 ["Can PharmaLens tell me if medicine is genuine?","No. PharmaLens only screens visible packaging against available reference records. An image cannot confirm chemical composition, quality, authenticity or safety."],
 ["What does Reference match mean?","It means the visible packaging details are consistent with an available documented reference. It is not a guarantee or regulatory approval."],
 ["Why did I get Unable to verify?","The image may be unreadable, evidence may be incomplete, or the product may not have a documented reference record."],
 ["Are guest scans uploaded?","No. Guest history remains in this browser. Account-based cloud storage requires a configured Supabase project and a signed-in user."],
 ["What should I do if packaging looks suspicious?","Do not rely on the scan alone. Keep the packaging, speak with a licensed pharmacist, and use an official regulator reporting channel where available."],
];
export default function Page(){return <><PageHeader eyebrow="Guidance" title="Help and frequently asked questions" description="Practical answers about scanning, outcomes, privacy and next steps."/><div className="faq-list">{faqs.map(([q,a])=><details className="card" key={q}><summary><CircleHelp size={18}/>{q}</summary><p>{a}</p></details>)}</div><div className="help-links card"><strong>Important information</strong><Link href="/limitations">Screening limitations</Link><Link href="/privacy">Privacy information</Link><Link href="/terms">Terms of use</Link></div></>}
