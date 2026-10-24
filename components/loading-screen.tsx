import { Logo } from "@/components/logo";

export function LoadingScreen({ compact = false }: { compact?: boolean }) {
  return <div className={compact ? "app-loading app-loading-compact" : "app-loading"} role="status" aria-live="polite" aria-label="Loading PharmaLens">
    <div className="loading-brand"><Logo/><div className="loading-lens" aria-hidden="true"><span/></div><strong>Preparing your workspace</strong><small>Loading secure screening tools…</small></div>
  </div>;
}
