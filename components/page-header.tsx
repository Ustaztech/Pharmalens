import Link from "next/link";
import { ArrowLeft } from "@/components/icons";

export function PageHeader({ eyebrow, title, description, back }: { eyebrow?: string; title: string; description?: string; back?: string }) {
  return <div className="page-header">{back && <Link href={back} className="back-link" aria-label="Go back"><ArrowLeft size={19} /> Back</Link>} {eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>;
}
