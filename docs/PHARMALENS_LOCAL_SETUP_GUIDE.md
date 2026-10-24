# PharmaLens

## Localhost and Software Guide

**Scan the pack. Spot the signs.**  
Version 1.0 · October 2026

> PharmaLens is a preliminary pharmaceutical-packaging screening application. It does not establish medicine authenticity, chemical composition, quality, regulatory approval, or safety.

---

## 1. About PharmaLens

PharmaLens is a mobile-first web application designed to help people in Nigeria examine visible information on medicine packaging. A user photographs or uploads a package, reviews text extracted by OCR, and compares supported label details with a documented reference catalogue.

The application returns one of three carefully limited outcomes:

- **Reference match** — the compared visible label details are consistent with an available published reference.
- **Needs review** — one or more visible details differ and should be checked further.
- **Unable to verify** — the photograph, extracted evidence, or reference coverage is insufficient.

Every outcome carries the same essential limitation: **visual screening does not confirm medicine authenticity or safety.**

### What the software includes

- Guest screening with device-only history.
- Camera capture and image upload, rotation, compression, and quality checks.
- Browser-based OCR using Tesseract.js.
- User review and correction of extracted label fields.
- Transparent, versioned label-comparison rules.
- Secure accounts, private cloud history, and private image storage when Supabase is configured.
- Consent-based review requests with status tracking.
- Versioned product references, reviewer tools, administration, and audit records.
- Responsive mobile and desktop interfaces, PWA metadata, and an offline public shell.

## 2. Why PharmaLens matters

Medicine packaging can contain useful warning signs: inconsistent strength, manufacturer details, expiry information, registration text, or unreadable labelling. PharmaLens helps users organise and review these visible signals without overstating what a photograph can prove.

Its value comes from four principles:

1. **Accessible first check.** A phone camera can help a user capture and review package information before seeking professional advice.
2. **Transparent evidence.** Results show what was observed, what reference was used, and what remains unresolved.
3. **Responsible language.** The software never labels a medicine “genuine,” “safe,” or “NAFDAC approved” from an image.
4. **Privacy by design.** OCR runs in the browser. Guest scans stay on the device, and account images are uploaded only after explicit retention consent.

PharmaLens supports careful decision-making; it does not replace a pharmacist, laboratory analysis, regulator, or authorised item-authentication service.

---

## 3. Quick localhost setup

Use this route to run the interface, guest scan flow, local OCR, demonstration mode, legal pages, and device-only history without creating any cloud account.

### Requirements

- Node.js 22 or newer.
- npm, included with Node.js.
- A current Chrome, Edge, Firefox, or Safari browser.
- Git, if cloning from GitHub.

### Install and run

```bash
git clone https://github.com/Ustaztech/Pharmalens.git
cd Pharmalens
npm ci
npm run dev
```

Open **http://localhost:3000**.

Do not copy `.env.example` for guest-only use. Placeholder Supabase values count as configured values and will cause failed account requests. With no `.env.local` file, PharmaLens automatically stays in guest mode.

### What works in quick mode

- Landing page and help content.
- Camera or image-upload workflow.
- Local image processing and OCR.
- Review and correction of extracted fields.
- “Unable to verify” when no real published reference is configured.
- Device-only guest scan history.
- Fictional, clearly marked demonstration mode at `/demo`.

### What does not work without Supabase

- Registration, login, email verification, and password recovery.
- Account-synchronised scan history.
- Private image retention.
- Production reference catalogue management.
- Review-request submission and tracking.
- Reviewer and administrator workflows.

The application explains these unavailable states instead of silently simulating them.

---

## 4. Full local setup with Supabase

Use this route when developing authentication, persistent records, private images, reporting, catalogue governance, or administration.

### Step 1 — Create a Supabase project

Create a development project at Supabase. Use a disposable, non-production project for local testing.

From the project settings, obtain:

- Project URL.
- Publishable or anonymous client key.

Never place the Supabase service-role key in a browser-visible environment variable.

### Step 2 — Configure local environment variables

```bash
cp .env.example .env.local
```

Replace the placeholders in `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-real-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-real-anon-key
NEXT_PUBLIC_DEMO_MODE=false
```

Restart the development server whenever environment values change.

### Step 3 — Apply database migrations

Apply every SQL file in `supabase/migrations/` in numeric order, from `001_initial_schema.sql` through the latest migration.

The migrations create and protect:

- Profiles and server-enforced roles.
- Products and immutable reference versions.
- Private scan evidence and extracted fields.
- Screening checks and consent records.
- Review requests, status events, and audit events.
- Private Storage buckets and row-level access policies.

Do not apply `supabase/seed_demo.sql` to production. It contains fictional demonstration data in a separate schema.

### Step 4 — Configure authentication redirects

Add this URL to the Supabase Auth redirect allow-list:

```text
http://localhost:3000/auth/callback
```

Configure an email provider if you need to test verification and password-recovery messages.

### Step 5 — Start the application

```bash
npm run dev
```

Open **http://localhost:3000**, create an account, and verify the email flow configured for the development project.

### Step 6 — Assign privileged roles safely

New accounts always receive the `user` role. After confirming the account identity, assign an administrator directly in the database:

```sql
update public.profiles
set role = 'admin'
where id = '<verified-user-uuid>';
```

Administrators can assign reviewer access from the protected administration screen. Never provide a public sign-up option for privileged roles.

---

## 5. Using PharmaLens locally

### Run a guest scan

1. Open `/scan`.
2. Choose **Use rear camera** or **Choose image**.
3. Keep the entire front panel visible in bright, even light.
4. Add optional back or side images when they contain batch, expiry, or manufacturer details.
5. Review the OCR text and correct uncertain fields.
6. Select **Screen label details**.
7. Read the outcome, evidence scope, expiry status, and limitations.
8. Save the scan to device-only history if desired.

### Run an account scan

The workflow is the same, but a signed-in user can save the evidence to private cloud history. Package images are retained only when both image retention and explicit upload consent are selected.

### Publish a reference locally

A reference must include real provenance, review information, and an authorised reviewer before publication. Only published versions participate in normal screening. Withdrawing a reference preserves earlier scan evidence and audit history.

Never use copied registration text, a barcode, or a QR code as independent proof of authenticity.

---

## 6. Verification commands

Run these checks before sharing a change:

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

If Playwright reports that Chromium is missing:

```bash
npx playwright install chromium
npm run test:e2e
```

The browser suite covers approximately 360 px, 390 px, 768 px, and 1440 px widths.

## 7. Common localhost problems

### Account actions report a configuration error

Check that `.env.local` contains real Supabase values and restart `npm run dev`. For guest-only use, remove `.env.local` instead of keeping placeholders.

### Camera access is unavailable

Use `localhost`, grant camera permission in browser settings, close other apps using the camera, or use **Choose image**. Non-local deployments require HTTPS for camera access.

### OCR is slow on the first scan

Tesseract.js loads OCR resources in the browser. The first run can take longer. Keep the tab open and use a sharp, well-lit image.

### A readable product returns “Unable to verify”

This is expected when no published reference exists or required label fields cannot be resolved. PharmaLens does not turn missing evidence into a favourable result.

### Email verification does not arrive

Confirm the development project’s email provider, templates, rate limits, and redirect allow-list. Also check the spam folder.

### Port 3000 is already in use

```bash
npm run dev -- -p 3001
```

Then open `http://localhost:3001` and add the corresponding auth callback URL when testing Supabase Auth.

---

## 8. Safety and production boundaries

Before any public launch, the operator must provide reviewed reference data, documented provenance, authorised reviewers, retention periods, support contacts, monitoring, backups, abuse controls, and legal, privacy, accessibility, security, and regulatory review.

Physical-device camera behaviour and medicine-authenticity performance require independent validation. A successful software build does not make PharmaLens a validated medical device or counterfeit detector.

### Need more detail?

See `README.md` and the documents in `docs/`, especially:

- `ARCHITECTURE.md`
- `SCREENING_POLICY.md`
- `PRIVACY_AND_DATA_FLOW.md`
- `DEPLOYMENT.md`
- `EXTERNAL_DEPENDENCIES.md`
- `TEST_RESULTS.md`

---

**PharmaLens** · Scan the pack. Spot the signs.  
Preliminary visual screening—not certification.
