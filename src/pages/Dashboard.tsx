import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import ProductManagement from '../components/ProductManagement';
import SupplierManagement from '../components/SupplierManagement';
import SalesTracking from '../components/SalesTracking';
import ExpenseTracking from '../components/ExpenseTracking';
import Analytics from '../components/Analytics';
import Insights from '../components/Insights';
import ChatAssistant from '../components/ChatAssistant';
import Profile from '../components/Profile';
import { OverviewTab } from '../components/OverviewTab';

type TabType = 'overview' | 'products' | 'suppliers' | 'sales' | 'expenses' | 'analytics' | 'insights' | 'profile';

interface DashboardProps {
  shopData: {
    shop_name: string;
    business_type: string;
  };
  onProductsChange: () => void;
  products: any[];
  handleLogout: () => void;
}

export default function Dashboard({ shopData, onProductsChange, products, handleLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    onProductsChange();
  }, [shopData.shop_name]);

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductManagement shopData={shopData} onProductsChange={onProductsChange} />;
      case 'suppliers':
        return <SupplierManagement shopData={shopData} products={products} />;
      case 'sales':
        return <SalesTracking shopData={shopData} />;
      case 'expenses':
        return <ExpenseTracking shopData={shopData} />;
      case 'analytics':
        return <Analytics shopData={shopData} products={products} />;
      case 'insights':
        return <Insights shopData={shopData} products={products} onTabChange={setActiveTab} />;
      case 'profile':
        return <Profile onLogout={handleLogout} />;
      default:
        return <OverviewTab shopData={shopData} products={products} onTabChange={setActiveTab} />;
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

        <main className="max-w-7xl mx-auto px-4 pt-32 pb-8">
          {renderContent()}
        </main>

        <ChatAssistant shopData={shopData} products={products} />
      </div>
    </div>
  );
}

// These components are now in OverviewTab.tsx
// function InteractiveStatCard(...) { ... }
// function MetricBox(...) { ... }
// function FeatureBox(...) { ... }

// function OverviewTab(...) { ... } // This is now imported