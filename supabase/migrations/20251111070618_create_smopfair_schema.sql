/*
  # SmopfAIr - Complete Database Schema

  ## Overview
  SmopfAIr is an AI-powered shop management system for small business owners.
  This migration creates all core tables for user management, product tracking,
  supplier records, sales, expenses, and analytics.

  ## Tables Created

  1. **shop_owners** - User profiles and shop details
  2. **products** - Product inventory with stock levels
  3. **suppliers** - Supplier/wholesaler information
  4. **purchase_records** - Historical purchase data with pricing
  5. **sales_records** - Daily sales transactions
  6. **expenses** - Operational expenses tracking
  7. **analytics_snapshots** - Weekly/monthly aggregated data
  8. **ai_insights** - Generated insights and alerts
  9. **offline_sync_queue** - Pending sync operations for offline mode

  ## Security
  - RLS enabled on all tables
  - Policies restrict access to shop owner's own data
  - Auth integration via Supabase auth.uid()
*/

-- Create shop_owners table
CREATE TABLE IF NOT EXISTS shop_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name text NOT NULL,
  owner_name text NOT NULL,
  business_type text NOT NULL,
  location text NOT NULL,
  preferred_language text DEFAULT 'en',
  phone_number text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_owner_id uuid NOT NULL REFERENCES shop_owners(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  quantity_on_hand numeric DEFAULT 0,
  quantity_unit text DEFAULT 'kg',
  selling_price numeric NOT NULL,
  current_cost_price numeric DEFAULT 0,
  last_restock_date timestamptz,
  reorder_level numeric DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_owner_id uuid NOT NULL REFERENCES shop_owners(id) ON DELETE CASCADE,
  supplier_name text NOT NULL,
  contact_person text,
  phone_number text,
  email text,
  location text,
  reliability_score numeric DEFAULT 5,
  quality_rating numeric DEFAULT 5,
  average_delivery_days numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchase_records table
CREATE TABLE IF NOT EXISTS purchase_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_owner_id uuid NOT NULL REFERENCES shop_owners(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  quantity_purchased numeric NOT NULL,
  buying_price numeric NOT NULL,
  total_cost numeric NOT NULL,
  purchase_date timestamptz DEFAULT now(),
  delivery_date timestamptz,
  quality_notes text,
  created_at timestamptz DEFAULT now()
);

-- Create sales_records table
CREATE TABLE IF NOT EXISTS sales_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_owner_id uuid NOT NULL REFERENCES shop_owners(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_sold numeric NOT NULL,
  selling_price numeric NOT NULL,
  total_revenue numeric NOT NULL,
  sale_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_owner_id uuid NOT NULL REFERENCES shop_owners(id) ON DELETE CASCADE,
  expense_category text NOT NULL,
  amount numeric NOT NULL,
  description text,
  expense_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create analytics_snapshots table
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_owner_id uuid NOT NULL REFERENCES shop_owners(id) ON DELETE CASCADE,
  snapshot_type text NOT NULL,
  snapshot_date date NOT NULL,
  total_sales numeric DEFAULT 0,
  total_expenses numeric DEFAULT 0,
  total_profit numeric DEFAULT 0,
  top_products jsonb DEFAULT '[]'::jsonb,
  low_stock_products jsonb DEFAULT '[]'::jsonb,
  supplier_performance jsonb DEFAULT '{}',
  growth_percentage numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_owner_id uuid NOT NULL REFERENCES shop_owners(id) ON DELETE CASCADE,
  insight_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  action_suggested text,
  priority_level text DEFAULT 'medium',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create offline_sync_queue table
CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_owner_id uuid NOT NULL REFERENCES shop_owners(id) ON DELETE CASCADE,
  table_name text NOT NULL,
  operation text NOT NULL,
  data jsonb NOT NULL,
  is_synced boolean DEFAULT false,
  synced_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE shop_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shop_owners
CREATE POLICY "shop_owners_select_own"
  ON shop_owners FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "shop_owners_insert_own"
  ON shop_owners FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "shop_owners_update_own"
  ON shop_owners FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for products
CREATE POLICY "products_select_own_shop"
  ON products FOR SELECT
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "products_insert_own_shop"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "products_update_own_shop"
  ON products FOR UPDATE
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "products_delete_own_shop"
  ON products FOR DELETE
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for suppliers
CREATE POLICY "suppliers_select_own_shop"
  ON suppliers FOR SELECT
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "suppliers_insert_own_shop"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "suppliers_update_own_shop"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "suppliers_delete_own_shop"
  ON suppliers FOR DELETE
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for purchase_records
CREATE POLICY "purchase_records_select_own"
  ON purchase_records FOR SELECT
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "purchase_records_insert_own"
  ON purchase_records FOR INSERT
  TO authenticated
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "purchase_records_update_own"
  ON purchase_records FOR UPDATE
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for sales_records
CREATE POLICY "sales_records_select_own"
  ON sales_records FOR SELECT
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "sales_records_insert_own"
  ON sales_records FOR INSERT
  TO authenticated
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "sales_records_update_own"
  ON sales_records FOR UPDATE
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for expenses
CREATE POLICY "expenses_select_own"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "expenses_insert_own"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "expenses_update_own"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for analytics_snapshots
CREATE POLICY "analytics_select_own"
  ON analytics_snapshots FOR SELECT
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "analytics_insert_own"
  ON analytics_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for ai_insights
CREATE POLICY "insights_select_own"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "insights_insert_own"
  ON ai_insights FOR INSERT
  TO authenticated
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "insights_update_own"
  ON ai_insights FOR UPDATE
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for offline_sync_queue
CREATE POLICY "sync_queue_select_own"
  ON offline_sync_queue FOR SELECT
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "sync_queue_insert_own"
  ON offline_sync_queue FOR INSERT
  TO authenticated
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "sync_queue_update_own"
  ON offline_sync_queue FOR UPDATE
  TO authenticated
  USING (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    shop_owner_id IN (
      SELECT id FROM shop_owners WHERE user_id = auth.uid()
    )
  );

-- Create indexes for common queries
CREATE INDEX idx_products_shop_owner ON products(shop_owner_id);
CREATE INDEX idx_purchase_records_shop_owner ON purchase_records(shop_owner_id);
CREATE INDEX idx_purchase_records_product ON purchase_records(product_id);
CREATE INDEX idx_sales_records_shop_owner ON sales_records(shop_owner_id);
CREATE INDEX idx_sales_records_date ON sales_records(sale_date);
CREATE INDEX idx_expenses_shop_owner ON expenses(shop_owner_id);
CREATE INDEX idx_analytics_shop_owner ON analytics_snapshots(shop_owner_id);
CREATE INDEX idx_insights_shop_owner ON ai_insights(shop_owner_id);
CREATE INDEX idx_sync_queue_shop_owner ON offline_sync_queue(shop_owner_id);