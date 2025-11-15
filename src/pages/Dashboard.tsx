import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navigation from '../components/Navigation';
import SetupFlow from '../components/SetupFlow';
import ProductManagement from '../components/ProductManagement';
import SupplierManagement from '../components/SupplierManagement';
import SalesTracking from '../components/SalesTracking';
import Analytics from '../components/Analytics';
import Insights from '../components/Insights';

type TabType = 'overview' | 'products' | 'suppliers' | 'sales' | 'expenses' | 'analytics' | 'insights';

export default function Dashboard() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [shopOwner, setShopOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    loadShopOwner();
  }, []);

  const loadShopOwner = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('shop_owners')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setShowSetup(true);
        } else {
          setShopOwner(data);
        }
      }
    } catch (error) {
      console.error('Error loading shop owner:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (showSetup || !shopOwner) {
    return <SetupFlow onComplete={() => loadShopOwner()} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductManagement shopOwnerId={shopOwner.id} />;
      case 'suppliers':
        return <SupplierManagement shopOwnerId={shopOwner.id} />;
      case 'sales':
        return <SalesTracking shopOwnerId={shopOwner.id} />;
      case 'analytics':
        return <Analytics shopOwnerId={shopOwner.id} />;
      case 'insights':
        return <Insights shopOwnerId={shopOwner.id} />;
      default:
        return <OverviewTab shopOwner={shopOwner} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        shopOwner={shopOwner}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSignOut={signOut}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

function OverviewTab({ shopOwner }: { shopOwner: any }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, [shopOwner.id]);

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [productsRes, salesRes, suppliersRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('shop_owner_id', shopOwner.id),
        supabase
          .from('sales_records')
          .select('total_revenue')
          .eq('shop_owner_id', shopOwner.id)
          .eq('sale_date', today),
        supabase
          .from('suppliers')
          .select('*')
          .eq('shop_owner_id', shopOwner.id),
      ]);

      const products = productsRes.data || [];
      const sales = salesRes.data || [];
      const suppliers = suppliersRes.data || [];

      const totalRevenue = sales.reduce((sum: number, s: any) => sum + s.total_revenue, 0);
      const lowStockCount = products.filter((p: any) => p.quantity_on_hand <= p.reorder_level).length;

      setStats({
        totalProducts: products.length,
        lowStockCount,
        todayRevenue: totalRevenue,
        totalSuppliers: suppliers.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InteractiveStatCard
          label="Shop Name"
          value={shopOwner.shop_name}
          icon="🏪"
          gradient="from-blue-500 to-blue-600"
        />
        <InteractiveStatCard
          label="Business Type"
          value={shopOwner.business_type}
          icon="💼"
          gradient="from-purple-500 to-purple-600"
        />
        <InteractiveStatCard
          label="Location"
          value={shopOwner.location}
          icon="📍"
          gradient="from-green-500 to-green-600"
        />
        <InteractiveStatCard
          label="Language"
          value={shopOwner.preferred_language.toUpperCase()}
          icon="🌐"
          gradient="from-orange-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats && (
          <>
            <MetricBox
              label="Total Products"
              value={stats.totalProducts}
              icon="📦"
              color="from-indigo-500 to-indigo-600"
            />
            <MetricBox
              label="Today's Revenue"
              value={`₹${stats.todayRevenue.toFixed(0)}`}
              icon="💰"
              color="from-green-500 to-green-600"
            />
            <MetricBox
              label="Low Stock Items"
              value={stats.lowStockCount}
              icon="⚠️"
              color="from-red-500 to-red-600"
            />
            <MetricBox
              label="Active Suppliers"
              value={stats.totalSuppliers}
              icon="🤝"
              color="from-yellow-500 to-yellow-600"
            />
          </>
        )}
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl p-8 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -ml-20 -mb-20"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-6">Welcome to SmopfAIr! 👋</h2>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            Your AI-powered shop management system is ready to help you grow your business. Here's what you can do:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureBox
              icon="📦"
              title="Manage Products"
              description="Add, edit, and track your inventory with real-time stock levels"
            />
            <FeatureBox
              icon="💳"
              title="Track Sales"
              description="Record daily sales and monitor revenue trends instantly"
            />
            <FeatureBox
              icon="🤝"
              title="Manage Suppliers"
              description="Track suppliers, ratings, and optimize purchasing decisions"
            />
            <FeatureBox
              icon="📊"
              title="View Analytics"
              description="Get detailed insights into sales trends and profitability"
            />
            <FeatureBox
              icon="💡"
              title="AI Insights"
              description="Receive smart recommendations to grow your business"
            />
            <FeatureBox
              icon="📱"
              title="Offline Support"
              description="Work seamlessly even without internet connection"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InteractiveStatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: string;
  icon: string;
  gradient: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform cursor-pointer group`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white text-opacity-90 text-sm font-medium group-hover:text-opacity-100 transition">{label}</p>
          <p className="text-2xl font-bold mt-2 truncate">{value}</p>
        </div>
        <div className="text-4xl opacity-30 group-hover:opacity-50 transition">{icon}</div>
      </div>
      <div className="h-1 bg-white bg-opacity-30 rounded-full mt-4 overflow-hidden">
        <div className="h-full bg-white opacity-60 w-3/4"></div>
      </div>
    </div>
  );
}

function MetricBox({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 text-white transform hover:shadow-2xl hover:scale-105 transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white text-opacity-90 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <span className="text-5xl opacity-30">{icon}</span>
      </div>
      <div className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
        <div className="h-full bg-white opacity-40 w-2/3 animate-pulse"></div>
      </div>
    </div>
  );
}

function FeatureBox({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-lg p-4 hover:bg-opacity-20 transition group cursor-pointer">
      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  );
}
