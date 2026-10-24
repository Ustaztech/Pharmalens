import { describe,expect,it,vi } from "vitest";
import { extractCandidates } from "@/lib/services/field-extraction";
import { parseExpiry,TransparentScreeningDecisionService } from "@/lib/services/screening-decision";
import type { CatalogueReference,ImageQualityResult,OcrResult } from "@/lib/services/contracts";

const quality:ImageQualityResult={acceptable:true,measurements:{width:1200,height:900,bytes:500000,meanBrightness:120,contrast:45,blurVariance:100},issues:[]};
const ocr=(text="SAMPLE 250 mg tablet\nManufactured by: Example Works\nEXP 12/2099"):OcrResult=>({rawText:text,confidence:88,engineId:"test-ocr",fields:extractCandidates(text,88)});
const reference:CatalogueReference={id:"ref-1",version:2,productId:"p-1",productName:"Sample",presentation:"20 tablets",strength:"250 mg",dosageForm:"tablet",manufacturer:"Example Works",registrationNumber:"",packageText:[],packagingVersion:"BOX-B",reviewedAt:"2026-01-01T00:00:00Z",sourceName:"Test source"};
describe("transparent decision policy",()=>{
 it("keeps unsupported products unable to verify",()=>expect(new TransparentScreeningDecisionService().decide({quality,ocr:ocr(),reference:null,hasFrontImage:true}).reasonCodes).toContain("REFERENCE_UNAVAILABLE"));
 it("returns needs review for an independently documented mismatch",()=>{const result=new TransparentScreeningDecisionService().decide({quality,ocr:ocr("SAMPLE 500 mg tablet\nManufactured by: Example Works\nEXP 12/2099"),reference,hasFrontImage:true});expect(result.outcome).toBe("needs_review");expect(result.reasonCodes).toContain("STRENGTH_MISMATCH")});
 it("describes a passing result as label details only",()=>{const result=new TransparentScreeningDecisionService().decide({quality,ocr:ocr(),reference,hasFrontImage:true});expect(result.outcome).toBe("reference_match");expect(result.comparisonScope).toBe("label_details");expect(result.modelIdentifier).toBeNull()});
 it("never upgrades an unreadable image",()=>{const result=new TransparentScreeningDecisionService().decide({quality:{...quality,acceptable:false},ocr:ocr(),reference,hasFrontImage:true});expect(result.outcome).toBe("unable_to_verify");expect(result.reasonCodes).toContain("IMAGE_UNREADABLE")});
});
describe("expiry parsing",()=>{it("keeps day-first dates ambiguous",()=>expect(parseExpiry("02/03/2027")).toBe("ambiguous"));it("separates expired status from packaging outcome",()=>{vi.useFakeTimers();vi.setSystemTime(new Date("2026-10-24T00:00:00Z"));expect(parseExpiry("09/2026")).toBe("expired");expect(parseExpiry("12/2027")).toBe("valid");vi.useRealTimers()})});
