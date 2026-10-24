# PharmaLens architecture

## Runtime boundaries

- Next.js App Router renders the public, account, reviewer and administrator experiences.
- Supabase Auth provides email/password sessions. `proxy.ts` refreshes secure auth cookies.
- PostgreSQL is the source of truth for account scans, immutable reference versions, review requests, consent and audit events. Row-level policies are the primary data boundary.
- Supabase Storage buckets are private. Account scan images use owner-prefixed paths. Detail views request five-minute signed URLs.
- Tesseract.js OCR runs in the browser. No packaging image is sent to an OCR or generative-model provider in this implementation.
- Guest records use `pharmalens-guest-scans`. Fictional demo records use a different key, `pharmalens-fictional-demo-scans`, and never participate in production lookup.

## Service layer

Contracts are in `lib/services/contracts.ts`:

- `ImageQualityService` — measured dimensions, bytes, brightness and contrast; labelled sharpness heuristic.
- `OcrService` — raw text, engine confidence and field candidates.
- `ProductRecognitionService` — integration contract; no trained visual recognition implementation is configured.
- `ReferenceCatalogueService` — integration contract; the current client queries published Supabase reference versions.
- `ScreeningDecisionService` — deterministic, versioned label-details rules.
- `ExternalVerificationAdapter` — disabled integration boundary; no external adapter is configured.
- `ReportService` — integration contract; reporting is implemented through a transactional database function.

Packaging text is treated only as untrusted data. It is not executed, sent to tools, or used to change application instructions or authorisation.

## Evidence preservation

`reference_versions` are immutable historical records in normal operation. Each retained scan stores its reference version ID and a JSON snapshot, decision-policy identifier, optional model identifier, reason codes, comparison scope and expiry status. Later reference withdrawal does not rewrite an earlier scan.

`extracted_fields` separates machine value, engine confidence, user value, source, correction and ambiguity. `screening_checks` records observed/expected values and evidence source.

## Roles

- User: own scans, images, reports, consents and report history.
- Reviewer: assigned review queue, report status transitions and reported evidence; cannot modify original scan evidence or decisions.
- Administrator: reviewer access, products, reference versions, adapters and audit inspection.

Navigation is hidden by role, but the actual boundary is server-side RLS plus security-definer functions that re-check the caller.

## Transactional operations

`submit_review_report` creates consent, report and initial event in one transaction and reuses an existing report for the same owner/idempotency key. `update_report_status`, `set_user_role`, `delete_own_report` and `delete_my_pharmalens_data` enforce authorisation in PostgreSQL.
