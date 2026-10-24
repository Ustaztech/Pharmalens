import type { ScreeningOutcome } from "@/lib/types";

export type PackageSide = "front" | "back" | "side";
export type ReasonCode = "IMAGE_UNREADABLE"|"PACKAGE_INCOMPLETE"|"PRODUCT_UNSUPPORTED"|"REFERENCE_UNAVAILABLE"|"FIELD_EXTRACTION_UNCERTAIN"|"STRENGTH_MISMATCH"|"MANUFACTURER_MISMATCH"|"PACKAGING_VERSION_UNRESOLVED"|"EXTERNAL_SERVICE_UNAVAILABLE"|"LABEL_DETAILS_CONSISTENT";
export type FieldSource = "machine"|"manual";
export type ExpiryStatus = "not_detected"|"ambiguous"|"valid"|"expired";

export type FieldCandidate={value:string;confidence:number|null;source:FieldSource;corrected:boolean;ambiguous?:boolean};
export type ExtractedCandidates={productName:FieldCandidate;strength:FieldCandidate;dosageForm:FieldCandidate;manufacturer:FieldCandidate;registrationNumber:FieldCandidate;batchNumber:FieldCandidate;manufacturingDate:FieldCandidate;expiryDate:FieldCandidate};
export type ImageMeasurement={width:number;height:number;bytes:number;meanBrightness:number|null;contrast:number|null;blurVariance:number|null};
export type ImageQualityResult={acceptable:boolean;measurements:ImageMeasurement;issues:Array<{code:"TOO_SMALL"|"TOO_DARK"|"TOO_BRIGHT"|"LOW_CONTRAST"|"POSSIBLY_BLURRED";message:string;kind:"measurement"|"heuristic"}>};
export type OcrResult={rawText:string;confidence:number|null;fields:ExtractedCandidates;engineId:string};
export type CatalogueReference={id:string;version:number;productId:string;productName:string;presentation:string;strength:string;dosageForm:string;manufacturer:string;registrationNumber:string;packageText:string[];packagingVersion:string;reviewedAt:string;sourceName:string};
export type ScreeningCheck={code:ReasonCode;label:string;status:"consistent"|"different"|"unresolved";observed:string|null;expected:string|null;evidenceSource:"ocr"|"user_correction"|"reference_catalogue"|"image_quality"|"external_adapter"};
export type ScreeningDecision={outcome:ScreeningOutcome;reasonCodes:ReasonCode[];explanation:string;checks:ScreeningCheck[];expiryStatus:ExpiryStatus;comparisonScope:"none"|"label_details";policyVersion:string;modelIdentifier:string|null;referenceId:string|null;referenceVersion:number|null;referenceReviewedAt:string|null};

export interface ImageQualityService{assess(file:File):Promise<ImageQualityResult>}
export interface OcrService{extract(file:File,onProgress?:(progress:number)=>void):Promise<OcrResult>}
export interface ProductRecognitionService{recognise(fields:ExtractedCandidates):Promise<{productId:string|null;method:"registration_number"|"product_name"|"none"}>}
export interface ReferenceCatalogueService{findPublished(fields:ExtractedCandidates):Promise<CatalogueReference|null>}
export interface ScreeningDecisionService{decide(input:{quality:ImageQualityResult;ocr:OcrResult;reference:CatalogueReference|null;hasFrontImage:boolean}):ScreeningDecision}
export interface ExternalVerificationAdapter{readonly id:string;readonly configured:boolean;verify(input:{registrationNumber?:string;batchNumber?:string}):Promise<{available:boolean;responseCode?:string}>}
export interface ReportService{submit(input:{scanId:string;description:string;consentId:string;idempotencyKey:string;contact?:string}):Promise<{reportId:string;reference:string}>}
