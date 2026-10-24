# Verification record

The current source is checked with:

- TypeScript through the Next.js production build.
- ESLint.
- Vitest unit/component tests for OCR field parsing, consent validation, unsupported products, missing references, unreadable evidence, discrepancy rules, comparison scope and expiry ambiguity.
- Playwright responsive tests at 360 × 800, 390 × 844, 768 × 1024 and 1440 × 900.

Latest local verification: ESLint passed, the production build completed, 13 Vitest tests passed, and 36 Playwright checks passed across the four viewport projects.

Credential-dependent Supabase integration tests require a disposable test project and are not represented as completed without those credentials. Physical-device camera behavior and medicine-authenticity performance remain unvalidated.
