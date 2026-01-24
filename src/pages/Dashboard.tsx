import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import ProductManagement from '../components/ProductManagement';
import SupplierManagement from '../components/SupplierManagement';
import SalesTracking from '../components/SalesTracking';
import Analytics from '../components/Analytics';
import Insights from '../components/Insights';
import ChatAssistant from '../components/ChatAssistant';

type TabType = 'overview' | 'products' | 'suppliers' | 'sales' | 'expenses' | 'analytics' | 'insights';

interface DashboardProps {
  shopData: {
    shop_name: string;
    business_type: string;
  };
}

export default function Dashboard({ shopData }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
  }, [shopData.shop_name]);

  const loadProducts = () => {
    const savedProducts = localStorage.getItem(`products_${shopData.shop_name}`);
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductManagement shopData={shopData} onProductsChange={loadProducts} />;
      case 'suppliers':
        return <SupplierManagement shopData={shopData} />;
      case 'sales':
        return <SalesTracking shopData={shopData} />;
      case 'analytics':
        return <Analytics shopData={shopData} />;
      case 'insights':
        return <Insights shopData={shopData} />;
      default:
        return <OverviewTab shopData={shopData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-300 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-300 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <div className="relative z-10">
        <Navigation
          shopData={shopData}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          products={products}
        />

        <main className="max-w-7xl mx-auto px-4 py-8">
          {renderContent()}
        </main>

        <ChatAssistant shopData={shopData} products={products} />
      </div>
    </div>
  );
}

function OverviewTab({ shopData }: { shopData: { shop_name: string; business_type: string } }) {
  // Mock data for demonstration - in a real app, this would come from your database
  const stats = {
    totalProducts: 0,
    lowStockCount: 0,
    todayRevenue: 0,
    totalSuppliers: 0,
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InteractiveStatCard
          label="Shop Name"
          value={shopData.shop_name}
          icon="🏪"
          gradient="from-blue-500 to-blue-600"
        />
        <InteractiveStatCard
          label="Business Type"
          value={shopData.business_type}
          icon="💼"
          gradient="from-purple-500 to-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 rounded-2xl shadow-2xl p-8 text-white overflow-hidden relative border border-white/10 backdrop-blur-sm">
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
