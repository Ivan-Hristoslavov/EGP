-- =====================================================
-- Lock down admin_profile (SECURITY FIX)
-- =====================================================
-- PROBLEM
--   20250115_fix_rls_policies.sql and 20250215_enable_rls_admin_profile.sql created
--   "Allow all operations on admin_profile" (FOR ALL USING (true) WITH CHECK (true))
--   and ran GRANT ALL ... TO anon. The anon key is public (NEXT_PUBLIC_*), so anyone
--   could read the admin password hash / bank details and overwrite the password.
--
-- FIX
--   Remove every policy on admin_profile and revoke anon/authenticated privileges.
--   RLS stays ENABLED with no policies = deny-all for anon/authenticated.
--   The server uses the service role (supabaseAdmin), which bypasses RLS and is
--   NOT affected by this migration.
--
-- !!! RUN ONLY AFTER the matching code is deployed !!!
--   All server code must read/write admin_profile through supabaseAdmin first
--   (app/api/admin/profile, payments/*, admin/team, pricing-cards, lib/sendgrid.ts,
--   lib/smtp-mail.ts). If this runs before that deploy, saving the admin profile,
--   payment-link emails and email sender lookup will stop working until it is deployed.
--
-- ROLLBACK (restores the INSECURE state - emergency use only):
--   CREATE POLICY "Allow all operations on admin_profile" ON public.admin_profile
--     FOR ALL USING (true) WITH CHECK (true);
--   GRANT ALL ON public.admin_profile TO anon;
-- =====================================================

-- 1) Drop ALL policies on admin_profile (whatever their names are)
DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_profile'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.admin_profile', p.policyname);
  END LOOP;
END $$;

-- 2) Remove table privileges from the public-facing roles
REVOKE ALL ON public.admin_profile FROM anon;
REVOKE ALL ON public.admin_profile FROM authenticated;

-- 3) Keep RLS on (deny-all for anon/authenticated; service_role bypasses it)
ALTER TABLE public.admin_profile ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.admin_profile IS
  'Admin profile information. RLS enabled with NO policies: accessible only via the server-side service role.';

-- =====================================================
-- VERIFY (run after the migration)
-- =====================================================
-- Should return 0 rows:
--   SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='admin_profile';
-- Should return 0 rows (anon has no privileges):
--   SELECT grantee, privilege_type FROM information_schema.role_table_grants
--   WHERE table_schema='public' AND table_name='admin_profile' AND grantee IN ('anon','authenticated');
