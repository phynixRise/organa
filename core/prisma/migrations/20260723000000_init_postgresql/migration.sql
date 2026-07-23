-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Case-insensitive email uniqueness (replaces Prisma @unique which is case-sensitive)
-- Application code must lowercase emails before insert/lookup
CREATE UNIQUE INDEX idx_accounts_email_lower ON accounts (lower(email));

-- One active subscription per account (partial unique index)
CREATE UNIQUE INDEX idx_one_active_subscription ON subscriptions(account_id) WHERE status = 'active';

-- No duplicate customer emails per org
CREATE UNIQUE INDEX idx_customers_org_email ON customers(org_id, email) WHERE email IS NOT NULL;

-- No duplicate barcodes per org
CREATE UNIQUE INDEX idx_products_org_barcode ON products_services(org_id, barcode) WHERE barcode IS NOT NULL;

-- Customer phone lookup by org
CREATE INDEX idx_customers_org_phone ON customers(org_id, phone) WHERE phone IS NOT NULL;

-- Unprocessed events index (for event worker)
CREATE INDEX idx_events_unprocessed ON events(org_id) WHERE processed_at IS NULL;

-- Prevent double-booking: same staff member cannot have overlapping appointments
ALTER TABLE appointments ADD CONSTRAINT no_overlap_staff
  EXCLUDE USING gist (
    staff_account_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (staff_account_id IS NOT NULL AND status = 'booked');
