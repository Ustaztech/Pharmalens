import type { ExtractedCandidates,FieldCandidate } from "@/lib/services/contracts";

const empty=():FieldCandidate=>({value:"",confidence:null,source:"machine",corrected:false});
const candidate=(value:string|undefined,confidence:number|null,ambiguous=false):FieldCandidate=>({value:value?.trim()??"",confidence,source:"machine",corrected:false,ambiguous});
const match=(text:string,pattern:RegExp)=>text.match(pattern)?.[1];

export function extractCandidates(text:string,confidence:number|null):ExtractedCandidates{
 const lines=text.split(/\n+/).map(line=>line.trim()).filter(Boolean);const product=lines.find(line=>line.length>2&&line.length<80);
 const expiry=match(text,/(?:exp(?:iry)?|use before)[\s.:#-]*([a-z0-9/-]{4,})/i);const manufacturing=match(text,/(?:mfg|mfd|manufactur(?:ed|ing) date)[\s.:#-]*([a-z0-9/-]{4,})/i);
 const ambiguous=(value?:string)=>Boolean(value&&/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(value));
 return {productName:product?candidate(product,confidence):empty(),strength:candidate(match(text,/\b(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|%))\b/i),confidence),dosageForm:candidate(match(text,/\b(tablets?|capsules?|syrup|suspension|cream|ointment|drops?|injection|solution)\b/i),confidence),manufacturer:candidate(match(text,/(?:manufactured|made)\s+by[:\s-]*([^\n]{3,80})/i),confidence),registrationNumber:candidate(match(text,/(?:nafdac(?:\s*(?:reg\.?\s*)?no\.?)?|reg(?:istration)?\.?\s*no\.?)[:\s#-]*([a-z0-9-]{4,})/i),confidence),batchNumber:candidate(match(text,/(?:batch|lot|bn)[\s.:#-]*([a-z0-9/-]{3,})/i),confidence),manufacturingDate:candidate(manufacturing,confidence,ambiguous(manufacturing)),expiryDate:candidate(expiry,confidence,ambiguous(expiry))};
}

export function correctField(fields:ExtractedCandidates,key:keyof ExtractedCandidates,value:string):ExtractedCandidates{return {...fields,[key]:{...fields[key],value,source:"manual",corrected:true,ambiguous:key==="expiryDate"||key==="manufacturingDate"?fields[key].ambiguous:false}}}
