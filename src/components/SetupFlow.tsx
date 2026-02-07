import { useState } from 'react';
import { Store, Briefcase, User, Globe, Settings } from 'lucide-react';

interface SetupFlowProps {
  onComplete: (shopData: { shop_name: string; business_type: string }) => void;
}

export default function SetupFlow({ onComplete }: SetupFlowProps) {
  const [formData, setFormData] = useState({
    shop_name: '',
    business_type: '',
    owner_name: '',
    language: 'English',
    currency: 'INR',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.shop_name && formData.business_type && formData.owner_name) {
      // Save to localStorage
      localStorage.setItem('shopData', JSON.stringify(formData));

      // Also initialize profile with owner name
      const names = formData.owner_name.split(' ');
      const userProfile = {
        firstName: names[0] || '',
        middleName: names.length > 2 ? names.slice(1, -1).join(' ') : '',
        lastName: names.length > 1 ? names[names.length - 1] : '',
        shopName: formData.shop_name,
        shopType: formData.business_type,
        age: '',
        phoneNumber: '',
        email: '',
        profilePhoto: '',
      };
      localStorage.setItem('userProfile', JSON.stringify(userProfile));

      onComplete(formData);
    }
  };

  const businessTypes = [
    'Grocery Store',
    'Textile Store',
    'Hardware Store',
    'Pharmacy',
    'General Store',
    'Electronics',
    'Clothing',
    'Restaurant',
    'Medical Store',
    'Book Store',
    'Mobile Shop',
    'Other',
  ];

  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-300/30 to-transparent rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-300/30 to-transparent rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-xl w-full relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/50">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg border border-gray-100 overflow-hidden">
              <img src="/logo.jpg" alt="SmopfAIr" className="w-full h-full object-cover" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Welcome to SmopfAIr</h1>
          <p className="text-center text-gray-600 mb-8">Let's get your shop set up in seconds</p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) =>
                    setFormData({ ...formData, owner_name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shop Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Name
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.shop_name}
                    onChange={(e) =>
                      setFormData({ ...formData, shop_name: e.target.value })
                    }
                    placeholder="My Shop"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  <select
                    value={formData.business_type}
                    onChange={(e) =>
                      setFormData({ ...formData, business_type: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    required
                  >
                    <option value="">Select Type</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Language
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  <select
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Currency/Prefs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <div className="relative">
                  <Settings className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition transform hover:scale-105"
            >
              Get Started
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            AI-Powered Shop Management for Small Businesses
          </p>
        </div>
      </div>
    </div>
  );
}
