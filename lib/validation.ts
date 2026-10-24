import { z } from "zod";

export const authSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
});

export const reportSchema = z.object({
  scanId: z.string().min(1),
  reason: z.enum(["packaging_discrepancy", "registration_concern", "expiry_concern", "other"]),
  notes: z.string().max(1000).optional(),
  consentToShare: z.literal(true, { error: "Consent is required before a report can be submitted" }),
});

export const referenceSchema = z.object({
  productName: z.string().trim().min(2).max(120),
  manufacturer: z.string().trim().min(2).max(120),
  registrationNumber: z.string().trim().max(80).optional(),
  packageText: z.array(z.string().trim().min(2).max(120)).min(1, "Add at least one visible package marker"),
  sourceName: z.string().trim().min(2).max(160),
  sourceUrl: z.union([z.url(), z.literal("")]).optional(),
  sourceCheckedAt: z.iso.datetime(),
});
