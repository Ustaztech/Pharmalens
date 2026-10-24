import { z } from "zod";

export const passwordSchema = z.string().min(8, "Use at least 8 characters").max(72, "Password is too long");

export const authSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  password: passwordSchema,
});

export const reportSchema = z.object({
  scanId: z.string().min(1),
  reason: z.enum(["packaging_discrepancy", "registration_concern", "expiry_concern", "other"]),
  notes: z.string().trim().min(10, "Describe what you observed in at least 10 characters").max(1000),
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
