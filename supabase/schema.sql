-- ==============================================================================
-- VAJRA STONE & PEBBLE ERP - RELATIONAL POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY
-- Designed for Indian Quarry Operations & Stone Trading Businesses
-- ==============================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE business_mode_enum AS ENUM ('trading', 'quarry', 'combined');
CREATE TYPE user_role_enum AS ENUM ('owner', 'manager', 'accountant', 'sales', 'operations');
CREATE TYPE material_category_enum AS ENUM ('pebbles', 'coloured_pebbles', 'jalli_aggregates', 'gravel', 'm_sand', 'boulders', 'granite_slabs');
CREATE TYPE unit_of_measure_enum AS ENUM ('MT', 'kg', 'm3', 'brass', 'sqft');
CREATE TYPE customer_type_enum AS ENUM ('landscaper', 'dealer', 'contractor', 'wholesaler', 'individual');
CREATE TYPE customer_status_enum AS ENUM ('lead', 'active', 'inactive', 'blocked');
CREATE TYPE quotation_status_enum AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'converted');
CREATE TYPE order_status_enum AS ENUM ('draft', 'confirmed', 'dispatched', 'delivered', 'closed', 'cancelled');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'partial', 'paid', 'overdue');
CREATE TYPE purchase_status_enum AS ENUM ('requested', 'ordered', 'partially_received', 'received', 'cancelled');
CREATE TYPE trip_status_enum AS ENUM ('planned', 'loaded', 'in_transit', 'delivered', 'settled', 'cancelled');
CREATE TYPE stock_movement_enum AS ENUM ('purchase_in', 'sales_out', 'quarry_production', 'damage_loss', 'adjustment', 'transfer');
CREATE TYPE expense_category_enum AS ENUM (
  'freight_transport',
  'labour_wages',
  'fuel_diesel',
  'crusher_electricity',
  'explosives_blasting',
  'machinery_repairs',
  'stockyard_rent',
  'quarry_royalty',
  'office_admin',
  'other'
);
CREATE TYPE payment_mode_enum AS ENUM ('upi', 'neft_rtgs', 'cheque', 'cash');
CREATE TYPE payment_type_enum AS ENUM ('customer_receipt', 'supplier_payment', 'transporter_payment');

-- 2. ORGANIZATIONS / TENANTS
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  trade_name VARCHAR(255),
  business_mode business_mode_enum NOT NULL DEFAULT 'combined',
  gstin VARCHAR(15),
  pan VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100) DEFAULT 'Karnataka',
  pincode VARCHAR(10),
  bank_name VARCHAR(100),
  bank_account_no VARCHAR(50),
  bank_ifsc VARCHAR(20),
  bank_branch VARCHAR(100),
  invoice_prefix VARCHAR(10) DEFAULT 'VS-INV',
  quotation_prefix VARCHAR(10) DEFAULT 'VS-QT',
  purchase_prefix VARCHAR(10) DEFAULT 'VS-PO',
  default_gst_rate NUMERIC(5,2) DEFAULT 5.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER MEMBERSHIPS
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'operations',
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MATERIAL CATALOGUE
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) NOT NULL,
  category material_category_enum NOT NULL,
  size VARCHAR(50),
  color VARCHAR(50),
  grade VARCHAR(50),
  intended_application TEXT,
  default_unit unit_of_measure_enum NOT NULL DEFAULT 'MT',
  density_factor NUMERIC(6,3) DEFAULT 1.600, -- MT per cubic metre
  standard_purchase_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  standard_selling_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  min_stock_level NUMERIC(12,2) DEFAULT 10.00,
  current_stock NUMERIC(12,2) DEFAULT 0.00,
  stock_location VARCHAR(150) DEFAULT 'Main Stockyard',
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, code)
);

-- 5. SUPPLIERS & EXTERNAL QUARRIES
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(150),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  address TEXT,
  district VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  gstin VARCHAR(15),
  quarry_location VARCHAR(200),
  materials_supplied TEXT[],
  payment_terms_days INTEGER DEFAULT 15,
  credit_limit NUMERIC(14,2) DEFAULT 0.00,
  total_purchases NUMERIC(14,2) DEFAULT 0.00,
  outstanding_balance NUMERIC(14,2) DEFAULT 0.00,
  loading_availability VARCHAR(100) DEFAULT 'Immediate',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CUSTOMER & BUYER CRM
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  company_name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(150),
  customer_type customer_type_enum NOT NULL DEFAULT 'contractor',
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  billing_address TEXT,
  delivery_address TEXT,
  district VARCHAR(100),
  state VARCHAR(100) DEFAULT 'Karnataka',
  pincode VARCHAR(10),
  gstin VARCHAR(15),
  payment_terms_days INTEGER DEFAULT 30,
  credit_limit NUMERIC(14,2) DEFAULT 500000.00,
  status customer_status_enum DEFAULT 'active',
  expected_monthly_demand_tonnes NUMERIC(10,2),
  negotiated_pricing_notes TEXT,
  total_revenue NUMERIC(14,2) DEFAULT 0.00,
  outstanding_balance NUMERIC(14,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. QUOTATIONS
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  quotation_number VARCHAR(50) NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  valid_until DATE NOT NULL,
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  total_tax NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  delivery_charges NUMERIC(14,2) DEFAULT 0.00,
  grand_total NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  terms TEXT,
  status quotation_status_enum DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, quotation_number)
);

CREATE TABLE IF NOT EXISTS quotation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id),
  material_name VARCHAR(200) NOT NULL,
  quantity NUMERIC(12,2) NOT NULL,
  unit unit_of_measure_enum NOT NULL DEFAULT 'MT',
  unit_price NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2) DEFAULT 0.00,
  tax_rate_percent NUMERIC(5,2) DEFAULT 5.00,
  tax_amount NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(14,2) NOT NULL
);

-- 8. SALES ORDERS & INVOICES
CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  order_number VARCHAR(50) NOT NULL,
  quotation_id UUID REFERENCES quotations(id),
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(200) NOT NULL,
  customer_phone VARCHAR(20),
  customer_gstin VARCHAR(15),
  delivery_address TEXT,
  destination_city VARCHAR(100),
  destination_state VARCHAR(100),
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  status order_status_enum DEFAULT 'confirmed',
  payment_status payment_status_enum DEFAULT 'pending',
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  delivery_charges NUMERIC(14,2) DEFAULT 0.00,
  grand_total NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  advance_paid NUMERIC(14,2) DEFAULT 0.00,
  balance_due NUMERIC(14,2) NOT NULL,
  invoice_number VARCHAR(50),
  invoice_date DATE,
  weighbridge_ref VARCHAR(100),
  delivery_confirmed_by VARCHAR(150),
  delivery_confirmed_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, order_number)
);

CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sales_order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id),
  material_name VARCHAR(200) NOT NULL,
  quantity NUMERIC(12,2) NOT NULL,
  unit unit_of_measure_enum NOT NULL DEFAULT 'MT',
  unit_price NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2) DEFAULT 0.00,
  tax_rate_percent NUMERIC(5,2) DEFAULT 5.00,
  tax_amount NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(14,2) NOT NULL
);

-- 9. PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  po_number VARCHAR(50) NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  supplier_name VARCHAR(200) NOT NULL,
  order_date DATE NOT NULL,
  expected_dispatch_date DATE,
  status purchase_status_enum DEFAULT 'ordered',
  payment_status payment_status_enum DEFAULT 'pending',
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  loading_charges NUMERIC(14,2) DEFAULT 0.00,
  tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  landed_cost NUMERIC(14,2) NOT NULL,
  amount_paid NUMERIC(14,2) DEFAULT 0.00,
  balance_payable NUMERIC(14,2) NOT NULL,
  supplier_invoice_no VARCHAR(100),
  supplier_invoice_date DATE,
  stock_location_received VARCHAR(150),
  shortage_damage_qty NUMERIC(10,2) DEFAULT 0.00,
  received_confirmed_by VARCHAR(150),
  received_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, po_number)
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id),
  material_name VARCHAR(200) NOT NULL,
  ordered_quantity NUMERIC(12,2) NOT NULL,
  received_quantity NUMERIC(12,2) DEFAULT 0.00,
  unit unit_of_measure_enum NOT NULL DEFAULT 'MT',
  negotiated_rate NUMERIC(12,2) NOT NULL,
  tax_rate_percent NUMERIC(5,2) DEFAULT 5.00,
  tax_amount NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(14,2) NOT NULL
);

-- 10. LORRY & TRANSPORT LOGISTICS
CREATE TABLE IF NOT EXISTS lorry_trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  trip_number VARCHAR(50) NOT NULL,
  lorry_number VARCHAR(30) NOT NULL,
  transporter_name VARCHAR(150) NOT NULL,
  driver_name VARCHAR(100) NOT NULL,
  driver_phone VARCHAR(20),
  vehicle_capacity_mt NUMERIC(6,2) NOT NULL,
  sales_order_id UUID REFERENCES sales_orders(id),
  purchase_order_id UUID REFERENCES purchase_orders(id),
  customer_name VARCHAR(200) NOT NULL,
  supplier_name VARCHAR(200) NOT NULL,
  material_id UUID REFERENCES materials(id),
  material_name VARCHAR(200) NOT NULL,
  source_quarry VARCHAR(200) NOT NULL,
  destination_site VARCHAR(255) NOT NULL,
  distance_km NUMERIC(8,2) DEFAULT 0.00,
  ordered_quantity_mt NUMERIC(10,2) NOT NULL,
  gross_weight_mt NUMERIC(10,2),
  tare_weight_mt NUMERIC(10,2),
  net_weight_mt NUMERIC(10,2) NOT NULL,
  weighbridge_slip_no VARCHAR(100),
  loading_date DATE NOT NULL,
  dispatch_date DATE NOT NULL,
  actual_arrival_date DATE,
  freight_agreed_rate NUMERIC(12,2) NOT NULL,
  total_freight NUMERIC(12,2) NOT NULL,
  loading_charges NUMERIC(12,2) DEFAULT 0.00,
  unloading_charges NUMERIC(12,2) DEFAULT 0.00,
  tolls_and_permits NUMERIC(12,2) DEFAULT 0.00,
  driver_advance NUMERIC(12,2) DEFAULT 0.00,
  settlement_amount NUMERIC(12,2) NOT NULL,
  status trip_status_enum DEFAULT 'planned',
  is_overloaded BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, trip_number)
);

-- 11. LOAD-WISE PROFIT CALCULATIONS
CREATE TABLE IF NOT EXISTS load_profit_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES lorry_trips(id) ON DELETE CASCADE,
  trip_number VARCHAR(50) NOT NULL,
  customer_name VARCHAR(200) NOT NULL,
  supplier_name VARCHAR(200) NOT NULL,
  material_name VARCHAR(200) NOT NULL,
  quantity_mt NUMERIC(10,2) NOT NULL,
  customer_selling_rate_per_mt NUMERIC(12,2) NOT NULL,
  total_sales_revenue NUMERIC(14,2) NOT NULL,
  supplier_purchase_rate_per_mt NUMERIC(12,2) NOT NULL,
  total_supplier_cost NUMERIC(14,2) NOT NULL,
  freight_cost NUMERIC(12,2) NOT NULL,
  loading_unloading_cost NUMERIC(12,2) NOT NULL,
  toll_permit_cost NUMERIC(12,2) NOT NULL,
  other_direct_costs NUMERIC(12,2) DEFAULT 0.00,
  total_direct_costs NUMERIC(14,2) NOT NULL,
  gross_profit NUMERIC(14,2) NOT NULL,
  gross_profit_per_mt NUMERIC(12,2) NOT NULL,
  gross_margin_percent NUMERIC(6,2) NOT NULL,
  customer_payment_status VARCHAR(50) DEFAULT 'pending',
  transporter_payment_status VARCHAR(50) DEFAULT 'pending',
  supplier_payment_status VARCHAR(50) DEFAULT 'pending',
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. INVENTORY & STOCK LEDGER
CREATE TABLE IF NOT EXISTS stock_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  material_id UUID REFERENCES materials(id),
  material_name VARCHAR(200) NOT NULL,
  movement_type stock_movement_enum NOT NULL,
  quantity_change NUMERIC(12,2) NOT NULL,
  unit unit_of_measure_enum NOT NULL DEFAULT 'MT',
  balance_after NUMERIC(12,2) NOT NULL,
  location VARCHAR(150) NOT NULL,
  reference_type VARCHAR(50),
  reference_id VARCHAR(100),
  performed_by VARCHAR(150),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. BUSINESS EXPENSES
CREATE TABLE IF NOT EXISTS business_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category expense_category_enum NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  payment_method payment_mode_enum NOT NULL DEFAULT 'bank_transfer',
  description TEXT NOT NULL,
  vendor_supplier_name VARCHAR(200),
  related_lorry_trip_id UUID REFERENCES lorry_trips(id),
  is_approved BOOLEAN DEFAULT TRUE,
  approved_by VARCHAR(150),
  is_reversed BOOLEAN DEFAULT FALSE,
  receipt_attachment_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. PAYMENTS & ALLOCATIONS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  payment_type payment_type_enum NOT NULL,
  date DATE NOT NULL,
  party_name VARCHAR(200) NOT NULL,
  party_id UUID,
  amount NUMERIC(14,2) NOT NULL,
  payment_mode payment_mode_enum NOT NULL DEFAULT 'neft_rtgs',
  reference_number VARCHAR(100) NOT NULL,
  allocated_invoice_id UUID,
  allocated_invoice_no VARCHAR(100),
  is_advance BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. OWN QUARRY SITES & PRODUCTION
CREATE TABLE IF NOT EXISTS quarry_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  site_code VARCHAR(50) NOT NULL,
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
  survey_numbers TEXT NOT NULL,
  area_acres NUMERIC(6,2),
  permit_number VARCHAR(100) NOT NULL,
  permit_issuing_authority VARCHAR(200) NOT NULL,
  permit_issue_date DATE NOT NULL,
  permit_expiry_date DATE NOT NULL,
  quarry_type VARCHAR(100) DEFAULT 'Granite Aggregates',
  daily_capacity_mt NUMERIC(10,2) DEFAULT 300.00,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, site_code)
);

CREATE TABLE IF NOT EXISTS quarry_production_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  quarry_site_id UUID REFERENCES quarry_sites(id),
  quarry_site_name VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  shift VARCHAR(50) DEFAULT 'Day Shift',
  material_produced VARCHAR(200) NOT NULL,
  produced_quantity_mt NUMERIC(10,2) NOT NULL,
  rejected_waste_mt NUMERIC(10,2) DEFAULT 0.00,
  operating_hours NUMERIC(6,2) NOT NULL,
  fuel_consumed_litres NUMERIC(8,2) NOT NULL,
  labour_wages_paid NUMERIC(12,2) NOT NULL,
  crushing_screening_expense NUMERIC(12,2) NOT NULL,
  calculated_cost_per_ton NUMERIC(10,2) NOT NULL,
  supervisor_name VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. MACHINERY & MAINTENANCE
CREATE TABLE IF NOT EXISTS heavy_machinery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100) NOT NULL,
  quarry_site_id UUID REFERENCES quarry_sites(id),
  purchase_date DATE,
  purchase_cost NUMERIC(14,2) DEFAULT 0.00,
  total_operating_hours NUMERIC(10,2) DEFAULT 0.00,
  fuel_consumption_rate_lph NUMERIC(6,2) DEFAULT 0.00,
  last_service_date DATE,
  next_service_due_date DATE,
  status VARCHAR(50) DEFAULT 'operational',
  total_maintenance_expense NUMERIC(14,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  machine_id UUID REFERENCES heavy_machinery(id) ON DELETE CASCADE,
  machine_name VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  hour_meter_reading NUMERIC(10,2) NOT NULL,
  cost NUMERIC(12,2) NOT NULL,
  technician_name VARCHAR(150),
  spare_parts_replaced TEXT,
  downtime_hours NUMERIC(6,2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_name VARCHAR(150) NOT NULL,
  user_role user_role_enum NOT NULL,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  details TEXT NOT NULL,
  ip_address VARCHAR(50)
);

-- 18. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lorry_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_profit_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarry_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarry_production_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE heavy_machinery ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user org_id
CREATE OR REPLACE FUNCTION current_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Tenant Isolation Policies (Users only see records belonging to their organization)
CREATE POLICY org_isolation_materials ON materials FOR ALL USING (org_id = current_user_org_id());
CREATE POLICY org_isolation_customers ON customers FOR ALL USING (org_id = current_user_org_id());
CREATE POLICY org_isolation_suppliers ON suppliers FOR ALL USING (org_id = current_user_org_id());
CREATE POLICY org_isolation_sales ON sales_orders FOR ALL USING (org_id = current_user_org_id());
CREATE POLICY org_isolation_purchases ON purchase_orders FOR ALL USING (org_id = current_user_org_id());
CREATE POLICY org_isolation_trips ON lorry_trips FOR ALL USING (org_id = current_user_org_id());
CREATE POLICY org_isolation_load_profits ON load_profit_calculations FOR ALL USING (org_id = current_user_org_id());
CREATE POLICY org_isolation_stock ON stock_ledger FOR ALL USING (org_id = current_user_org_id());
CREATE POLICY org_isolation_expenses ON business_expenses FOR ALL USING (org_id = current_user_org_id());
CREATE POLICY org_isolation_payments ON payments FOR ALL USING (org_id = current_user_org_id());
CREATE POLICY org_isolation_quarry ON quarry_sites FOR ALL USING (org_id = current_user_org_id());
CREATE POLICY org_isolation_audit ON audit_logs FOR ALL USING (org_id = current_user_org_id());
