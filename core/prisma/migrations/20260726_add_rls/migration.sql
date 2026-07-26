-- Enable Row Level Security on all tenant tables
-- and create policies that enforce org-level isolation

-- Helper function: returns the current account ID from the session variable
CREATE OR REPLACE FUNCTION auth.account_id() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('app.current_account_id', true), '')::uuid;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Enable RLS on all tenant tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Organizations: members can read, owners can update/delete
CREATE POLICY org_select ON organizations
  FOR SELECT USING (
    id IN (SELECT org_id FROM memberships WHERE account_id = auth.account_id())
  );
CREATE POLICY org_insert ON organizations
  FOR INSERT WITH CHECK (owner_account_id = auth.account_id());
CREATE POLICY org_update ON organizations
  FOR UPDATE USING (owner_account_id = auth.account_id());
CREATE POLICY org_delete ON organizations
  FOR DELETE USING (owner_account_id = auth.account_id());

-- Memberships: members can read their own org's memberships
CREATE POLICY membership_select ON memberships
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM memberships WHERE account_id = auth.account_id())
  );
CREATE POLICY membership_insert ON memberships
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM memberships WHERE account_id = auth.account_id() AND role IN ('owner', 'admin'))
  );

-- All org-scoped tables: SELECT/INSERT/UPDATE/DELETE if member of the org
DO $$
DECLARE
  tbl text;
  org_cols text[] := ARRAY['org_id'];
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'customers', 'locations', 'products_services', 'staff_shifts',
    'orders', 'order_items', 'payments', 'appointments',
    'inventory_stock', 'gym_memberships', 'gym_plans', 'gym_classes',
    'medical_records', 'org_features', 'events', 'audit_log'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY %I_select ON %I FOR SELECT USING (
        %I IN (SELECT org_id FROM memberships WHERE account_id = auth.account_id())
      )', tbl, tbl, 'org_id'
    );
    EXECUTE format(
      'CREATE POLICY %I_insert ON %I FOR INSERT WITH CHECK (
        %I IN (SELECT org_id FROM memberships WHERE account_id = auth.account_id())
      )', tbl, tbl, 'org_id'
    );
    EXECUTE format(
      'CREATE POLICY %I_update ON %I FOR UPDATE USING (
        %I IN (SELECT org_id FROM memberships WHERE account_id = auth.account_id())
      )', tbl, tbl, 'org_id'
    );
    EXECUTE format(
      'CREATE POLICY %I_delete ON %I FOR DELETE USING (
        %I IN (SELECT org_id FROM memberships WHERE account_id = auth.account_id())
      )', tbl, tbl, 'org_id'
    );
  END LOOP;
END $$;

-- gym_class_bookings: uses class_id -> gym_classes.org_id
CREATE POLICY gym_class_booking_select ON gym_class_bookings
  FOR SELECT USING (
    class_id IN (
      SELECT gc.id FROM gym_classes gc
      WHERE gc.org_id IN (SELECT org_id FROM memberships WHERE account_id = auth.account_id())
    )
  );
CREATE POLICY gym_class_booking_insert ON gym_class_bookings
  FOR INSERT WITH CHECK (
    class_id IN (
      SELECT gc.id FROM gym_classes gc
      WHERE gc.org_id IN (SELECT org_id FROM memberships WHERE account_id = auth.account_id())
    )
  );

-- Allow the application role to bypass RLS (for super-admin operations)
-- This is used only by the super-admin dashboard with a separate connection string
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;
ALTER TABLE locations FORCE ROW LEVEL SECURITY;
ALTER TABLE products_services FORCE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts FORCE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
ALTER TABLE order_items FORCE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;
ALTER TABLE appointments FORCE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock FORCE ROW LEVEL SECURITY;
ALTER TABLE gym_memberships FORCE ROW LEVEL SECURITY;
ALTER TABLE gym_plans FORCE ROW LEVEL SECURITY;
ALTER TABLE gym_classes FORCE ROW LEVEL SECURITY;
ALTER TABLE gym_class_bookings FORCE ROW LEVEL SECURITY;
ALTER TABLE medical_records FORCE ROW LEVEL SECURITY;
ALTER TABLE org_features FORCE ROW LEVEL SECURITY;
ALTER TABLE events FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;
