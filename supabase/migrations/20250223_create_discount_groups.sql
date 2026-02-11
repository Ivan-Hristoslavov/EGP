-- =====================================================
-- Discount groups for services
-- =====================================================
-- Migration: 20250223_create_discount_groups.sql
-- Creates discount_groups table and adds discount_group_id to services.
-- =====================================================

CREATE TABLE IF NOT EXISTS discount_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discount_groups_is_active ON discount_groups(is_active);

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS discount_group_id UUID REFERENCES discount_groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_services_discount_group_id ON services(discount_group_id);

-- RLS
ALTER TABLE discount_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on discount_groups" ON discount_groups;
CREATE POLICY "Allow all on discount_groups" ON discount_groups FOR ALL USING (true);

-- updated_at trigger
DROP TRIGGER IF EXISTS update_discount_groups_updated_at ON discount_groups;
CREATE TRIGGER update_discount_groups_updated_at
  BEFORE UPDATE ON discount_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE discount_groups IS 'Groups of services that share a discount percentage';
COMMENT ON COLUMN services.discount_group_id IS 'Optional link to a discount group for this service';
