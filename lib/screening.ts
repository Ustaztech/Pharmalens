import type { ReferenceProduct, ScreeningOutcome } from "@/lib/types";

export const SCREENING_DISCLAIMER = "Visual screening does not confirm medicine authenticity or safety.";

export type ExtractedFields = {
  productName: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  registrationNumber: string;
};

const patterns = {
  batchNumber: /(?:batch|lot|bn)[\s.:#-]*([a-z0-9/-]{3,})/i,
  expiryDate: /(?:exp(?:iry)?|use before)[\s.:#-]*([a-z0-9/-]{4,})/i,
  registrationNumber: /(?:nafdac(?:\s*(?:reg\.?\s*)?no\.?)?|reg(?:istration)?\.?\s*no\.?)[:\s#-]*([a-z0-9-]{4,})/i,
  manufacturer: /(?:manufactured|made)\s+by[:\s-]*([^\n]{3,60})/i,
};

export function extractFields(text: string): ExtractedFields {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const productName = lines.find((line) => line.length > 2 && line.length < 60) ?? "Unidentified product";
  return {
    productName,
    manufacturer: text.match(patterns.manufacturer)?.[1]?.trim() ?? "",
    batchNumber: text.match(patterns.batchNumber)?.[1]?.trim() ?? "",
    expiryDate: text.match(patterns.expiryDate)?.[1]?.trim() ?? "",
    registrationNumber: text.match(patterns.registrationNumber)?.[1]?.trim() ?? "",
  };
}

export function screenPackaging(text: string, references: ReferenceProduct[] = []): {
  outcome: ScreeningOutcome;
  rationale: string;
  fields: ExtractedFields;
} {
  const fields = extractFields(text);
  const normalized = text.toLowerCase();
  if (normalized.trim().length < 24) {
    return { outcome: "unable_to_verify", rationale: "Not enough readable label text was captured. Try again in brighter light with the pack filling the frame.", fields };
  }
  if (!references.length) {
    return { outcome: "unable_to_verify", rationale: "The label was read, but no documented reference record is available for this product.", fields };
  }
  const reference = references.find((item) =>
    normalized.includes(item.productName.toLowerCase()) ||
    (fields.registrationNumber && item.registrationNumber.toLowerCase() === fields.registrationNumber.toLowerCase()),
  );
  if (!reference) {
    return { outcome: "unable_to_verify", rationale: "No matching product was found in the available reference catalogue.", fields };
  }
  const missingMarkers = reference.packageText.filter((marker) => !normalized.includes(marker.toLowerCase()));
  if (missingMarkers.length) {
    return { outcome: "needs_review", rationale: `A catalogue record was found, but ${missingMarkers.length} expected visible label detail${missingMarkers.length === 1 ? " is" : "s are"} missing.`, fields };
  }
  return { outcome: "reference_match", rationale: "The visible label text is consistent with the available documented reference. This is not proof of authenticity or safety.", fields };
}

export const outcomeContent = {
  reference_match: { label: "Reference match", description: "Visible packaging is consistent with an available reference." },
  needs_review: { label: "Needs review", description: "A visible discrepancy warrants further checking." },
  unable_to_verify: { label: "Unable to verify", description: "Evidence is insufficient, unreadable, or unsupported." },
} as const;
