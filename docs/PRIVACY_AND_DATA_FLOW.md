# Privacy and data flow

## Guest screening

Package image → browser orientation correction/compression → browser quality measurements → browser Tesseract OCR → browser decision rules → device-only local history.

Guest scans and images are not silently uploaded after login. Location is never requested. Raw packaging text is treated as untrusted input.

## Account screening

OCR remains in the browser. Parsed evidence and the decision can be saved to the account database. Package images are uploaded to private Supabase Storage only when the user enables retention and separately consents. The database stores private paths, never unrestricted public image URLs.

Detail views create five-minute signed URLs. Storage policies restrict normal image access to the owner; authorised reviewers can access images only for a submitted report.

## Review requests

The user chooses an account scan, reviews the included-image count, adds a description and optional contact, and explicitly consents. One database transaction writes consent, the report and the initial status event. An idempotency key prevents duplicate submissions. Reports enter only the internal reviewer queue and are not forwarded externally.

User reports and images are not training data. No training-data reuse path exists.

## Retention and deletion

Guest history can be cleared locally. Individual scans and reports can be deleted. Account holders can delete all retained PharmaLens scans, images, reports and consents while keeping the authentication account.

Production operators must set and publish actual retention periods before launch.

## Logs and remote access

The application does not log auth codes, OCR text, contact details or package images. It does not accept arbitrary remote image URLs and therefore has no server-side URL-fetch path.
