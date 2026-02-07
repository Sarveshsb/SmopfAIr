import { Store, Package, Users, ShoppingCart, Wallet, BarChart3, Lightbulb, User, Menu, X, ChevronRight, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import NotificationCenter from './NotificationCenter';

type TabType = 'overview' | 'products' | 'suppliers' | 'sales' | 'expenses' | 'analytics' | 'insights' | 'profile';

interface NavigationProps {
  shopData: {
    shop_name: string;
    business_type: string;
  };
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  products: any[];
}

export default function Navigation({
  shopData,
  activeTab,
  onTabChange,
  products,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadProfile = () => {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const { profilePhoto } = JSON.parse(savedProfile);
        setProfilePhoto(profilePhoto);
      }
    };

    loadProfile();
    window.addEventListener('storage', loadProfile);
    return () => window.removeEventListener('storage', loadProfile);
  }, []);

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Home', icon: Store },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'suppliers', label: 'Suppliers', icon: Users },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'expenses', label: 'Expenses', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
  ];

  const handleProfileClick = () => {
    onTabChange('profile');
  };

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'pt-2 px-4' : 'pt-6 px-6'}`}>
        <nav className={`mx-auto max-w-7xl transition-all duration-300 ${scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-lg rounded-2xl border border-white/20'
          : 'bg-white/70 backdrop-blur-md shadow-sm rounded-3xl border border-white/40'
          }`}>
          <div className="px-6">
            <div className="flex justify-between items-center h-16">
              {/* Logo Section */}
              <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => onTabChange('overview')}>
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-inner overflow-hidden border border-white/10">
                    <img src="/logo.jpg" alt="SmopfAIr" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <h1 className="font-bold text-gray-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors">SmopfAIr</h1>
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{shopData.shop_name}</p>
                </div>
              </div>

              {/* Desktop Tabs */}
              <div className="hidden md:flex items-center p-1 bg-gray-100/50 rounded-2xl border border-gray-200/50">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => onTabChange(id)}
                    className={`relative flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === id
                      ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${activeTab === id ? 'stroke-2' : 'stroke-[1.5]'}`} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Header Right (Profile + Mobile Menu) */}
              <div className="flex items-center space-x-2">
                {/* Profile */}
                <button
                  onClick={handleProfileClick}
                  className="group flex items-center space-x-3 p-1 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-sm opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative w-9 h-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white shadow-sm group-hover:ring-blue-100 transition-all">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                {/* Notification Center */}
                <NotificationCenter shopData={shopData} products={products} />

                {/* Mobile Extra Menu Button (Optional) */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden p-2 text-gray-600 hover:bg-gray-100/50 rounded-xl transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-2">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-3xl px-2 py-2 flex items-center justify-around translate-y-[-8px]">
          {tabs.slice(0, 5).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-300 rounded-2xl min-w-[64px] ${activeTab === id
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700 active:scale-90'
                }`}
            >
              <div className={`p-2 rounded-xl transition-colors duration-300 ${activeTab === id ? 'bg-blue-50 shadow-sm' : 'bg-transparent'
                }`}>
                <Icon className={`w-5 h-5 ${activeTab === id ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              </div>
              <span className={`text-[10px] font-bold mt-1 tracking-tight ${activeTab === id ? 'opacity-100' : 'opacity-70'
                }`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-gray-900/20 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[70] w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out md:hidden flex flex-col ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="font-bold text-lg text-gray-900">More</h2>
            <p className="text-xs text-gray-500">Shop Settings</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                onTabChange(id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${activeTab === id
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100'
                : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${activeTab === id ? 'text-blue-600' : 'text-gray-400'}`} />
                <span>{label}</span>
              </div>
              {activeTab === id && <ChevronRight className="w-4 h-4 text-blue-400" />}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/30">
          <button
            onClick={() => {
              handleProfileClick();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center space-x-3 p-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
              )}
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">My Profile</p>
              <p className="text-xs text-gray-500 truncate">View Settings</p>
            </div>
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </>
  );
}

