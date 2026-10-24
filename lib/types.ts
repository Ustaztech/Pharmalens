export type ScreeningOutcome = "reference_match" | "needs_review" | "unable_to_verify";

export type ScanRecord = {
  id: string;
  publicScanId?: string;
  createdAt: string;
  productName: string;
  manufacturer?: string;
  batchNumber?: string;
  expiryDate?: string;
  registrationNumber?: string;
  extractedText: string;
  outcome: ScreeningOutcome;
  rationale: string;
  imageUrl?: string;
  source: "guest" | "account";
  expiryStatus?: "not_detected"|"ambiguous"|"valid"|"expired";
  reasonCodes?: string[];
  comparisonScope?: "none"|"label_details";
};

export type ReferenceProduct = {
  id: string;
  productName: string;
  manufacturer: string;
  registrationNumber: string;
  packageText: string[];
  updatedAt: string;
  status: "published" | "draft";
};
