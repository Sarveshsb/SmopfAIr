import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  public: {
    Tables: {
      shop_owners: {
        Row: {
          id: string;
          user_id: string;
          shop_name: string;
          owner_name: string;
          business_type: string;
          location: string;
          preferred_language: string;
          phone_number: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['shop_owners']['Row'], 'id' | 'created_at' | 'updated_at'>;
      };
      products: {
        Row: {
          id: string;
          shop_owner_id: string;
          product_name: string;
          quantity_on_hand: number;
          quantity_unit: string;
          selling_price: number;
          current_cost_price: number;
          last_restock_date: string | null;
          reorder_level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
      };
      suppliers: {
        Row: {
          id: string;
          shop_owner_id: string;
          supplier_name: string;
          contact_person: string | null;
          phone_number: string | null;
          email: string | null;
          location: string | null;
          reliability_score: number;
          quality_rating: number;
          average_delivery_days: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['suppliers']['Row'], 'id' | 'created_at' | 'updated_at'>;
      };
      purchase_records: {
        Row: {
          id: string;
          shop_owner_id: string;
          product_id: string;
          supplier_id: string | null;
          quantity_purchased: number;
          buying_price: number;
          total_cost: number;
          purchase_date: string;
          delivery_date: string | null;
          quality_notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['purchase_records']['Row'], 'id' | 'created_at'>;
      };
      sales_records: {
        Row: {
          id: string;
          shop_owner_id: string;
          product_id: string;
          quantity_sold: number;
          selling_price: number;
          total_revenue: number;
          sale_date: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sales_records']['Row'], 'id' | 'created_at'>;
      };
      expenses: {
        Row: {
          id: string;
          shop_owner_id: string;
          expense_category: string;
          amount: number;
          description: string | null;
          expense_date: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at'>;
      };
      analytics_snapshots: {
        Row: {
          id: string;
          shop_owner_id: string;
          snapshot_type: string;
          snapshot_date: string;
          total_sales: number;
          total_expenses: number;
          total_profit: number;
          top_products: Array<{ name: string; quantity: number; revenue: number }>;
          low_stock_products: Array<{ name: string; quantity: number }>;
          supplier_performance: Record<string, any>;
          growth_percentage: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['analytics_snapshots']['Row'], 'id' | 'created_at'>;
      };
      ai_insights: {
        Row: {
          id: string;
          shop_owner_id: string;
          insight_type: string;
          title: string;
          description: string;
          action_suggested: string | null;
          priority_level: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ai_insights']['Row'], 'id' | 'created_at'>;
      };
      offline_sync_queue: {
        Row: {
          id: string;
          shop_owner_id: string;
          table_name: string;
          operation: string;
          data: Record<string, any>;
          is_synced: boolean;
          synced_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['offline_sync_queue']['Row'], 'id' | 'created_at'>;
      };
    };
  };
};
