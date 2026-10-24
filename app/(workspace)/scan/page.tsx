import { PageHeader } from "@/components/page-header"; import { ScanWorkflow } from "@/components/scan-workflow";
export const metadata={title:"Scan package"}; export default function Page(){return <><PageHeader eyebrow="Visual package screening" title="Scan a package" description="Capture one clear panel at a time. You will review all extracted details before screening."/><ScanWorkflow/></>}
