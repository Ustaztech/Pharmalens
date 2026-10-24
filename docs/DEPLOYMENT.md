# Deployment instructions

No deployment has been performed.

1. Provision a Supabase project and apply every file in `supabase/migrations/` in numeric order.
2. Do not apply `supabase/seed_demo.sql` to production. It creates a separate fictional `demo` schema for local demonstrations.
3. Configure the private storage buckets and verify all policies were applied.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the deployment environment. Never expose a service-role key.
5. Add the production `/auth/callback` URL to Supabase Auth redirects and configure verified email delivery.
6. Run `npm ci`, `npm test`, `npm run lint`, `npm run build`, and `npm run test:e2e` in CI.
7. Enforce HTTPS. Camera access requires a secure context outside localhost.
8. Configure Supabase Auth/storage/database rate limits, backups, monitoring and incident response.
9. Complete privacy, security, accessibility, legal and regulatory review before any public launch.

The application must not be described as production-ready for medicine-authenticity decisions without validated reference governance, authorised integrations and appropriate independent evaluation.
