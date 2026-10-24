import { describe,expect,it } from "vitest";
import { extractFields,screenPackaging,SCREENING_DISCLAIMER } from "@/lib/screening";

describe("responsible screening",()=>{
 it("extracts common visible label fields",()=>{const result=extractFields("AMOXIL 500mg\nManufactured by: Example Pharma Ltd\nBatch: AB123\nEXP: 10/2028\nNAFDAC No: A4-1234");expect(result.batchNumber).toBe("AB123");expect(result.expiryDate).toBe("10/2028");expect(result.registrationNumber).toBe("A4-1234")});
 it("does not claim a match without a documented reference",()=>{const result=screenPackaging("AMOXIL 500mg Batch AB123 EXP 10/2028 NAFDAC A4-1234",[]);expect(result.outcome).toBe("unable_to_verify");expect(result.rationale).toContain("no documented reference")});
 it("requires readable evidence",()=>{expect(screenPackaging("blur",[]).outcome).toBe("unable_to_verify")});
 it("uses the mandated disclaimer",()=>{expect(SCREENING_DISCLAIMER).toBe("Visual screening does not confirm medicine authenticity or safety.")});
});
