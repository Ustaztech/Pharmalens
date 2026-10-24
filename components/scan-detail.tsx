"use client";
/* eslint-disable @next/next/no-img-element -- short-lived private signed URLs */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "@/components/icons";
import { OutcomeCard } from "@/components/outcome-card";
import { deleteGuestScan, getGuestScans } from "@/lib/guest-storage";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ScanRecord } from "@/lib/types";

type ReferenceSnapshot = { version?: number; reviewedAt?: string; sourceName?: string } | null;
type StoredCheck = { reason_code: string; status: "consistent"|"different"|"unresolved"; observed: string|null; expected: string|null; evidence_source: string };

export function ScanDetail({ id }: { id: string }) {
  const router = useRouter();
  const [scan, setScan] = useState<ScanRecord | null | undefined>(undefined);
  const [images, setImages] = useState<Array<{ side: string; url: string }>>([]);

  useEffect(() => {
    queueMicrotask(async () => {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from("scans").select("id,public_scan_id,created_at,product_name,manufacturer,batch_number,expiry_date_text,registration_number,extracted_text,outcome,rationale,expiry_status,reason_codes,comparison_scope,reference_snapshot").eq("id", id).maybeSingle();
          if (data) {
            const [storedResult, checksResult] = await Promise.all([
              supabase.from("scan_images").select("storage_path,package_side").eq("scan_id", id),
              supabase.from("screening_checks").select("reason_code,status,observed,expected,evidence_source").eq("scan_id", id),
            ]);
            const snapshot = data.reference_snapshot as ReferenceSnapshot;
            const checks = (checksResult.data ?? []) as StoredCheck[];
            setScan({
              id: data.id, publicScanId: data.public_scan_id, createdAt: data.created_at,
              productName: data.product_name, manufacturer: data.manufacturer ?? undefined,
              batchNumber: data.batch_number ?? undefined, expiryDate: data.expiry_date_text ?? undefined,
              registrationNumber: data.registration_number ?? undefined, extractedText: data.extracted_text,
              outcome: data.outcome, rationale: data.rationale, source: "account",
              expiryStatus: data.expiry_status, reasonCodes: data.reason_codes,
              comparisonScope: data.comparison_scope, referenceVersion: snapshot?.version ?? null,
              referenceReviewedAt: snapshot?.reviewedAt ?? null, referenceSource: snapshot?.sourceName ?? null,
              checks: checks.map(check => ({ code: check.reason_code, label: check.reason_code.replaceAll("_", " "), status: check.status, observed: check.observed, expected: check.expected, evidenceSource: check.evidence_source })),
            });
            const signed = await Promise.all((storedResult.data ?? []).map(async item => {
              const { data: url } = await supabase.storage.from("package-images").createSignedUrl(item.storage_path, 300);
              return { side: item.package_side, url: url?.signedUrl ?? "" };
            }));
            setImages(signed.filter(item => item.url));
            return;
          }
        }
      }
      setScan(getGuestScans().find(item => item.id === id) ?? null);
    });
  }, [id]);

  async function remove() {
    if (!scan) return;
    if (scan.source === "account" && isSupabaseConfigured()) {
      const supabase = createClient();
      const { data: stored } = await supabase.from("scan_images").select("storage_path").eq("scan_id", scan.id);
      if (stored?.length) await supabase.storage.from("package-images").remove(stored.map(item => item.storage_path));
      await supabase.from("scans").delete().eq("id", scan.id);
    } else deleteGuestScan(scan.id);
    router.push("/history");
    router.refresh();
  }

  if (scan === undefined) return <div className="card empty-state"><p>Loading private scan…</p></div>;
  if (!scan) return <div className="card empty-state"><h3>Scan not found</h3><p>It may have been deleted or belong to another account.</p></div>;

  return <div className="scan-detail">
    <div className="card result-top"><span className="eyebrow">{scan.publicScanId ?? "Device-only scan"}</span><OutcomeCard outcome={scan.outcome} rationale={scan.rationale}/></div>
    {images.length > 0 && <div className="detail-images">{images.map(image => <figure className="card" key={image.side}><img src={image.url} alt={`${image.side} package evidence`}/><figcaption>{image.side} · signed private link expires in 5 minutes</figcaption></figure>)}</div>}
    <section className="card result-details"><h2>Retained evidence</h2><dl>
      <div><dt>Product</dt><dd>{scan.productName}</dd></div>
      <div><dt>Manufacturer</dt><dd>{scan.manufacturer || "Not resolved"}</dd></div>
      <div><dt>Printed registration</dt><dd>{scan.registrationNumber || "Not resolved"}</dd></div>
      <div><dt>Batch</dt><dd>{scan.batchNumber || "Not resolved"}</dd></div>
      <div><dt>Expiry text</dt><dd>{scan.expiryDate || "Not resolved"}</dd></div>
      <div><dt>Expiry status</dt><dd>{scan.expiryStatus?.replaceAll("_", " ") || "Not assessed"}</dd></div>
      <div><dt>Evidence scope</dt><dd>{scan.comparisonScope?.replaceAll("_", " ") || "No reference evidence"}</dd></div>
      <div><dt>Reference</dt><dd>{scan.referenceVersion ? `v${scan.referenceVersion} · ${scan.referenceSource ?? "source retained"}` : "No reference used"}</dd></div>
      <div><dt>Reference reviewed</dt><dd>{scan.referenceReviewedAt ? new Date(scan.referenceReviewedAt).toLocaleDateString("en-NG") : "Not applicable"}</dd></div>
      <div><dt>Timestamp</dt><dd>{new Date(scan.createdAt).toLocaleString("en-NG")}</dd></div>
    </dl><details><summary>Raw OCR text</summary><pre className="raw-ocr">{scan.extractedText}</pre></details></section>
    <section className="card evidence-card"><h2>Original screening checks</h2>{scan.checks?.length ? scan.checks.map(check => <div className="evidence-row" key={check.code}><span className={`check-status check-${check.status}`}>{check.status}</span><div><strong>{check.label}</strong><small>{check.code} · {check.evidenceSource.replaceAll("_", " ")}</small></div><span>{check.observed || "Not resolved"} / {check.expected || "No reference"}</span></div>) : <p>No comparison checks were supported by the retained evidence.</p>}</section>
    <div className="result-actions"><button onClick={remove} className="button button-ghost"><Trash2 size={17}/>Delete this scan</button></div>
  </div>;
}
