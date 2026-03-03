-- =============================================
-- BUY67 Seed Data
-- Run AFTER schema.sql
-- =============================================

-- Note: In production, profiles are auto-created via the auth trigger.
-- For testing, you can manually insert a profile after creating
-- a user through Supabase Auth dashboard.

-- Sample coupons
INSERT INTO public.coupons (code, discount_percent, active, expires_at) VALUES
  ('WELCOME10', 10, true, '2027-12-31T23:59:59Z'),
  ('HALF50', 50, true, '2027-06-30T23:59:59Z'),
  ('EXPIRED20', 20, true, '2024-01-01T00:00:00Z'),
  ('INACTIVE30', 30, false, NULL);

-- To seed products and orders, first create a user via Supabase Auth,
-- then use the following template (replace the UUID with your user's ID):
--
-- INSERT INTO public.products (title, description, price_paise, slug, file_path, cover_image, creator_id)
-- VALUES
--   ('Ultimate Design Kit', 'A comprehensive design toolkit with 500+ components, icons, and templates for modern web design.', 99900, 'ultimate-design-kit', 'products/design-kit.zip', NULL, 'YOUR-USER-UUID'),
--   ('Next.js Starter Template', 'Production-ready Next.js template with auth, payments, and dashboard built-in.', 49900, 'nextjs-starter-template', 'products/nextjs-starter.zip', NULL, 'YOUR-USER-UUID'),
--   ('Photography Presets Pack', '50 professional Lightroom presets for stunning photo editing.', 29900, 'photography-presets-pack', 'products/presets.zip', NULL, 'YOUR-USER-UUID'),
--   ('eBook: SaaS Playbook', 'Step-by-step guide to building and launching your SaaS product.', 19900, 'ebook-saas-playbook', 'products/saas-playbook.pdf', NULL, 'YOUR-USER-UUID'),
--   ('Icon Library Pro', '2000+ hand-crafted SVG icons in multiple styles.', 14900, 'icon-library-pro', 'products/icons.zip', NULL, 'YOUR-USER-UUID');
