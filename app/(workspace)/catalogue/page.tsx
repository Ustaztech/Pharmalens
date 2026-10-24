import { PageHeader } from "@/components/page-header"; import { CatalogueClient } from "@/components/catalogue-client";
export const metadata={title:"Reference catalogue"}; export default function Page(){return <><PageHeader eyebrow="Documented sources only" title="Reference catalogue" description="Only verified, attributable records are used for package comparison."/><CatalogueClient/></>}
