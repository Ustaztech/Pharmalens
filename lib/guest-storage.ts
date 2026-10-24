import type { ScanRecord } from "@/lib/types";

const KEY = "pharmalens-guest-scans";

export function getGuestScans(): ScanRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((value): value is ScanRecord => {
      if (!value || typeof value !== "object") return false;
      const scan = value as Partial<ScanRecord>;
      return typeof scan.id === "string" && typeof scan.createdAt === "string" &&
        typeof scan.productName === "string" && typeof scan.extractedText === "string" &&
        typeof scan.rationale === "string" && scan.source === "guest" &&
        ["reference_match", "needs_review", "unable_to_verify"].includes(scan.outcome ?? "");
    }).slice(0, 20);
  } catch { return []; }
}

export function saveGuestScan(scan: ScanRecord) {
  const current = getGuestScans();
  localStorage.setItem(KEY, JSON.stringify([scan, ...current].slice(0, 20)));
}

export function clearGuestScans() { localStorage.removeItem(KEY); }
export function deleteGuestScan(id:string){localStorage.setItem(KEY,JSON.stringify(getGuestScans().filter(scan=>scan.id!==id)))}
