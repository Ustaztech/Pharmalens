# PharmaLens

## Supabase + Render Connection Guide

**Secure accounts, private scan history, storage, reports, and administration**  
Updated October 2026

> Use a fresh Supabase project first. Never expose the Supabase `service_role` key in Render or in any variable beginning with `NEXT_PUBLIC_`.

## 1. Create the Supabase project

1. Sign in at `https://supabase.com/dashboard` and choose **New project**.
2. Select the organisation, enter a project name, create a strong database password, and choose the closest suitable region.
3. Wait until the project reports that it is healthy.
4. Open **Project Settings → API** (or **Connect**) and keep the following values ready:
   - Project URL, such as `https://abc123.supabase.co`.
   - Publishable key. A legacy `anon` key also works.
5. Do not copy the `service_role` key into the application.

## 2. Install the database safely

The recommended method applies the tracked migrations in their exact numeric order.

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

- `YOUR_PROJECT_REF` is the identifier before `.supabase.co` in the Project URL.
- The link command asks for the database password created in step 1.
- Confirm that migrations `001` through the latest numbered file are listed before approving the push.
- Do **not** run `supabase/seed_demo.sql` against production; it is fictional demonstration data.

After the push, open **Database → Tables** in Supabase and confirm that `profiles`, `scans`, `products`, `reference_versions`, `reports`, and their supporting tables exist. Under **Storage**, confirm that the private `package-images` and `reference-images` buckets exist.

## 3. Configure Supabase Authentication

1. Open **Authentication → URL Configuration**.
2. Set **Site URL** to the public Render address, for example:

   ```text
   https://pharmalens.onrender.com
   ```

3. Add these **Redirect URLs**, replacing the hostname with the exact Render hostname:

   ```text
   https://pharmalens.onrender.com/auth/callback
   http://localhost:3000/auth/callback
   ```

4. Keep email/password authentication enabled under **Authentication → Providers → Email**.
5. Keep email confirmation enabled for production.
6. For reliable production delivery, configure custom SMTP under **Project Settings → Authentication → SMTP Settings**. Supabase's default mail service is intended for limited testing.

If Render supplies a different service subdomain, use that exact origin. Do not add a trailing slash to the Site URL.

## 4. Add the variables in Render

1. Open the PharmaLens service in Render.
2. Choose **Environment**.
3. Add:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
   NEXT_PUBLIC_DEMO_MODE=false
   ```

4. Save the changes.
5. Choose **Manual Deploy → Clear build cache & deploy**. Next.js embeds `NEXT_PUBLIC_` values during the build, so a new build is required after changing them.

These two Supabase values are public client configuration, not server secrets. Database security comes from the row-level security policies installed by the migrations. The `service_role` key must remain absent.

## 5. Confirm the Render service settings

Use these settings for the Node web service:

```text
Build command: npm ci && npm run build
Start command: npm start
Health check path: /
```

Use Node.js 22 or newer. Render provides `PORT`; Next.js reads it automatically. Keep HTTPS enabled because mobile camera access requires a secure origin.

## 6. Verify the complete authentication flow

After the Render deployment is live:

1. Open `/signup` on the Render site.
2. Create a new non-privileged account and accept the terms.
3. Open the verification email and confirm that it returns to `/auth/callback`, then `/dashboard`.
4. Log out and log back in at `/login`.
5. Use **Forgot password**, open the recovery email, set a new password, and log in with it.
6. Run a scan and choose **Save scan**. Confirm it appears in `/history` after a refresh.
7. If image retention is enabled with explicit consent, confirm the file exists in the private `package-images` bucket and cannot be opened publicly.

In Supabase, check **Authentication → Users** for the account and **Table Editor → profiles** for its matching `user` role.

## 7. Create the first administrator

New registrations always receive the `user` role. After verifying the correct account, run this in the Supabase SQL editor:

```sql
update public.profiles
set role = 'admin'
where id = '<verified-auth-user-uuid>';
```

Log out and back in so the interface reloads the role. The administrator can then grant `reviewer` access through the protected administration page. Never add role selection to public registration.

## 8. Troubleshooting

### “Account services are not configured”

- Confirm both Render variables exist and contain real values rather than `.env.example` placeholders.
- Redeploy with a cleared build cache after changing `NEXT_PUBLIC_` variables.

### Verification or reset links return an error

- Confirm the exact Render `/auth/callback` URL is in the Supabase redirect allow-list.
- Confirm the Site URL uses `https://` and the current Render hostname.
- Request a fresh email; auth codes are short-lived and single-use.

### Login succeeds but cloud history is empty or writes fail

- Run `npx supabase db push` again and confirm every migration was applied.
- Check the browser network response and Supabase logs for a row-level security error.
- Confirm the authenticated user has a matching row in `public.profiles`.

### Render deploys but still uses old configuration

Clear the Render build cache and redeploy. Public Next.js variables are compiled into browser bundles at build time.

## 9. Production checklist

- Configure custom SMTP, backups, monitoring, and Supabase/Render usage alerts.
- Review Auth rate limits and abuse protection.
- Keep both storage buckets private.
- Add only reviewed, attributable reference records.
- Verify the mobile signup, login, verification, recovery, scan-save, and logout flows on the production HTTPS address.
- Complete legal, privacy, accessibility, security, and regulatory review before public use.

PharmaLens remains a preliminary visual-screening tool. Connecting Supabase does not validate medicine authenticity or safety.
