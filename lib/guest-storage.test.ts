import { beforeEach, describe, expect, it } from "vitest";
import { getGuestScans, saveGuestScan } from "@/lib/guest-storage";
import type { ScanRecord } from "@/lib/types";

const scan: ScanRecord = {
  id: "guest-1", createdAt: "2026-10-24T12:00:00.000Z", productName: "Example tablets",
  extractedText: "Example tablets 50 mg", outcome: "unable_to_verify",
  rationale: "No reference is available.", source: "guest",
};

describe("guest storage", () => {
  beforeEach(() => localStorage.clear());

  it("ignores corrupt and incorrectly shaped records", () => {
    localStorage.setItem("pharmalens-guest-scans", JSON.stringify({ records: [scan] }));
    expect(getGuestScans()).toEqual([]);
    localStorage.setItem("pharmalens-guest-scans", JSON.stringify([null, { id: "partial" }, scan]));
    expect(getGuestScans()).toEqual([scan]);
  });

  it("stores newest records first", () => {
    saveGuestScan(scan);
    saveGuestScan({ ...scan, id: "guest-2" });
    expect(getGuestScans().map(item => item.id)).toEqual(["guest-2", "guest-1"]);
  });
});
