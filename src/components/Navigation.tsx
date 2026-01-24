import { Store, Package, Users, ShoppingCart, BarChart3, Lightbulb, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import NotificationCenter from './NotificationCenter';

type TabType = 'overview' | 'products' | 'suppliers' | 'sales' | 'expenses' | 'analytics' | 'insights';

interface NavigationProps {
  shopData: {
    shop_name: string;
    business_type: string;
  };
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  products?: any[];
}

export default function Navigation({
  shopData,
  activeTab,
  onTabChange,
  products = [],
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Store },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'suppliers', label: 'Suppliers', icon: Users },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
  ];

  const handleNewShop = () => {
    // Clear localStorage and reload to show setup flow again
    localStorage.removeItem('shopData');
    window.location.reload();
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-xl border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">SmopfAIr</h1>
              <p className="text-xs text-gray-500">{shopData.shop_name}</p>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <div className="hidden md:flex items-center space-x-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <NotificationCenter shopData={shopData} products={products} />
            
            <button
              onClick={handleNewShop}
              className="hidden md:flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Start with a new shop"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">New Shop</span>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  onTabChange(id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
            <button
              onClick={() => {
                handleNewShop();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">New Shop</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
