# Verification record

The current source is checked with:

- TypeScript through the Next.js production build.
- ESLint.
- Vitest unit/component tests for OCR field parsing, consent validation, unsupported products, missing references, unreadable evidence, discrepancy rules, comparison scope and expiry ambiguity.
- Playwright responsive tests at 360 × 800, 390 × 844, 768 × 1024 and 1440 × 900.

Latest local verification (24 October 2026): ESLint passed, the production build completed, 17 Vitest tests passed, and 48 Playwright checks passed across the four viewport projects. Browser checks used the managed environment's system Chromium because the Playwright download host was unavailable.

Credential-dependent Supabase integration tests require a disposable test project and are not represented as completed without those credentials. Physical-device camera behavior and medicine-authenticity performance remain unvalidated.
