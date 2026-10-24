# PharmaLens

PharmaLens is a mobile-first preliminary visual screening application for pharmaceutical packaging marketed in Nigeria. It reads visible label text in the browser, lets the user correct OCR output, and compares it only with documented reference records.

It never treats image analysis as proof of authenticity, chemical composition, pharmaceutical quality, regulatory approval, or safety.

## Run locally

Requirements: Node.js 22+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Without Supabase credentials, guest scanning, local OCR, device-only history, legal pages and the complete interface still work. Account actions show a clear configuration message.

## Configure persistent accounts and storage

1. Create a Supabase project.
2. Apply every SQL file in `supabase/migrations/` in numeric order. Migration `002` hardens role access for databases created with the earlier policy version.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
4. Add `http://localhost:3000/auth/callback` to the allowed authentication redirect URLs.
5. Assign administrators directly in the database after verifying their identity: `update profiles set role = 'admin' where id = '<user uuid>';`. Users cannot select a privileged role during registration.

The migrations enable row-level security, owner-only scan/report policies, administrator-only catalogue publishing, a private `package-images` bucket, and draft-first reference governance. Do not put a Supabase service-role key in client-visible environment variables.

## Verification

```bash
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright covers the requested 360px, 390px, 768px, and 1440px layouts. Unit tests enforce the result language and no-reference behavior.

## Technical documentation

- `docs/PharmaLens-Localhost-Setup-Guide.pdf` — branded, print-ready product and localhost guide
- `docs/PHARMALENS_LOCAL_SETUP_GUIDE.md` — editable guide source
- `docs/SUPABASE_RENDER_SETUP.md` — step-by-step Supabase and Render connection guide
- `docs/ARCHITECTURE.md`
- `docs/SCREENING_POLICY.md`
- `docs/PRIVACY_AND_DATA_FLOW.md`
- `docs/DEPLOYMENT.md`
- `docs/EXTERNAL_DEPENDENCIES.md`
- `docs/TEST_RESULTS.md`

The fictional demonstration at `/demo` uses separate browser storage. Optional SQL demonstration data is isolated in the `demo` schema and must never be applied to production.

## Production checklist

- Provide attributable, reviewed reference data; the repository intentionally ships with none.
- Add operator identity, support contacts, retention periods and final legal review.
- Configure a real authorised reporting destination before claiming reports are submitted.
- Complete privacy, security, accessibility and clinical/regulatory risk review.
- Configure HTTPS, Supabase email templates, rate limits, abuse controls, monitoring and backups.
- Do not add NAFDAC or item-authentication claims without an authorised, tested integration.

No deployment is performed by this repository.
