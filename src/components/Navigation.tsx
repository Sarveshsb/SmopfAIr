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
          ? 'bg-[#1E293B]/95 backdrop-blur-xl shadow-lg rounded-2xl border border-slate-700/50'
          : 'bg-[#1E293B] shadow-lg rounded-3xl border border-slate-800'
          }`}>
          <div className="px-6">
            <div className="flex justify-between items-center h-16">
              {/* Logo Section */}
              <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => onTabChange('overview')}>
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative flex items-center justify-center w-10 h-10 bg-slate-800 rounded-full shadow-inner overflow-hidden border border-slate-700">
                    <img src="/logo.jpg" alt="SmopfAIr" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div>
                  <h1 className="font-bold text-white text-lg tracking-tight group-hover:text-emerald-400 transition-colors">SmopfAIr</h1>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{shopData.shop_name}</p>
                </div>
              </div>

              {/* Desktop Tabs */}
              <div className="hidden md:flex items-center p-1 bg-slate-800/50 rounded-2xl border border-slate-700">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => onTabChange(id)}
                    className={`relative flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === id
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 transform scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
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
                  className="group flex items-center space-x-3 p-1 rounded-full hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full blur-sm opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative w-9 h-9 rounded-full bg-slate-800 overflow-hidden ring-2 ring-slate-700 shadow-sm group-hover:ring-emerald-500/50 transition-all">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
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
                  className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
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
        <div className="bg-[#1E293B]/95 backdrop-blur-md border border-slate-700/50 shadow-xl rounded-3xl px-2 py-2 flex items-center justify-around translate-y-[-8px]">
          {tabs.slice(0, 5).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-300 rounded-2xl min-w-[64px] ${activeTab === id
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300 active:scale-90'
                }`}
            >
              <div className={`p-2 rounded-xl transition-colors duration-300 ${activeTab === id ? 'bg-emerald-500 shadow-lg shadow-emerald-900/20' : 'bg-transparent'
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
        className={`fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[70] w-72 bg-[#1E293B] shadow-2xl transform transition-transform duration-300 ease-out md:hidden flex flex-col border-l border-slate-800 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="font-bold text-lg text-white">More</h2>
            <p className="text-xs text-slate-400">Shop Settings</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
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
                ? 'bg-emerald-500/10 text-emerald-400 font-semibold shadow-sm border border-emerald-500/20'
                : 'text-slate-400 hover:bg-slate-800 border border-transparent'
                }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${activeTab === id ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{label}</span>
              </div>
              {activeTab === id && <ChevronRight className="w-4 h-4 text-emerald-400" />}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/30">
          <button
            onClick={() => {
              handleProfileClick();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center space-x-3 p-3 rounded-xl bg-slate-800 border border-slate-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden ring-2 ring-slate-600 shadow-sm flex-shrink-0">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-700">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="font-semibold text-white truncate">My Profile</p>
              <p className="text-xs text-slate-400 truncate">View Settings</p>
            </div>
            <Settings className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </>
  );
}
