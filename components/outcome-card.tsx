import { AlertTriangle, Check, CircleDashed } from "@/components/icons";
import { outcomeContent, SCREENING_DISCLAIMER } from "@/lib/screening";
import type { ScreeningOutcome } from "@/lib/types";

const icons = { reference_match: Check, needs_review: AlertTriangle, unable_to_verify: CircleDashed };

export function OutcomeCard({ outcome, rationale, compact = false }: { outcome: ScreeningOutcome; rationale?: string; compact?: boolean }) {
  const Icon = icons[outcome];
  const content = outcomeContent[outcome];
  return (
    <div className={`outcome outcome-${outcome} ${compact ? "outcome-compact" : ""}`}>
      <div className="outcome-icon"><Icon size={20} aria-hidden="true" /></div>
      <div>
        <strong>{content.label}</strong>
        <p>{rationale ?? content.description}</p>
        {!compact && <small>{SCREENING_DISCLAIMER}</small>}
      </div>
    </div>
  );
}
