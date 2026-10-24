import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/navigation";

describe("safeRedirectPath", () => {
  it("keeps local paths, queries, and fragments", () => {
    expect(safeRedirectPath("/history/scan-1?tab=evidence#checks")).toBe("/history/scan-1?tab=evidence#checks");
  });

  it.each(["https://example.com", "//example.com", "/\\example.com", "dashboard", ""])(
    "rejects unsafe redirect value %s",
    value => expect(safeRedirectPath(value)).toBe("/dashboard"),
  );
});
