import type { ScanRecord } from "@/lib/types";

const KEY = "pharmalens-guest-scans";

export function getGuestScans(): ScanRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as ScanRecord[]; } catch { return []; }
}

export function saveGuestScan(scan: ScanRecord) {
  const current = getGuestScans();
  localStorage.setItem(KEY, JSON.stringify([scan, ...current].slice(0, 20)));
}

export function clearGuestScans() { localStorage.removeItem(KEY); }
export function deleteGuestScan(id:string){localStorage.setItem(KEY,JSON.stringify(getGuestScans().filter(scan=>scan.id!==id)))}
