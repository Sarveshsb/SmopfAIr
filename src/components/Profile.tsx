import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, Home, Briefcase, Calendar, Image as ImageIcon, LogOut } from 'lucide-react';

interface ProfileProps {
  onLogout: () => void;
}

export default function Profile({ onLogout }: ProfileProps) {
  const [profile, setProfile] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    shopName: '',
    shopType: '',
    age: '',
    phoneNumber: '',
    email: '',
    profilePhoto: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      // Load initial values from shopData if available
      const shopData = localStorage.getItem('shopData');
      if (shopData) {
        const parsed = JSON.parse(shopData);
        setProfile(prev => ({
          ...prev,
          shopName: parsed.shop_name || '',
          shopType: parsed.business_type || ''
        }));
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profilePhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile saved:', profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    // Also update shopData if shop name changed
    const shopData = localStorage.getItem('shopData');
    if (shopData) {
      const parsed = JSON.parse(shopData);
      if (parsed.shop_name !== profile.shopName || parsed.business_type !== profile.shopType) {
        localStorage.setItem('shopData', JSON.stringify({
          ...parsed,
          shop_name: profile.shopName,
          business_type: profile.shopType
        }));
        // Ideally trigger a reload or callback to update app state, but localStorage update holds for next reload
        window.dispatchEvent(new Event('storage')); // Notify other components
      }
    }
    alert('Profile saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 pb-32">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">My Profile</h2>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div
              className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer overflow-hidden border-4 border-blue-200 shadow-md relative group"
              onClick={handlePhotoClick}
              title="Upload Profile Photo"
            >
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-16 h-16 text-gray-500" />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 font-medium">Edit</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
            <button
              type="button"
              onClick={handlePhotoClick}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {profile.profilePhoto ? 'Change Photo' : 'Upload Photo'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
                  placeholder="John"
                />
              </div>
            </div>
            <div>
              <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">Middle Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="middleName"
                  id="middleName"
                  value={profile.middleName}
                  onChange={handleChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">Shop Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Home className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="shopName"
                  id="shopName"
                  value={profile.shopName}
                  onChange={handleChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label htmlFor="shopType" className="block text-sm font-medium text-gray-700">Shop Type</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="shopType"
                  id="shopType"
                  value={profile.shopType}
                  onChange={handleChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="age"
                  id="age"
                  value={profile.age}
                  onChange={handleChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Year"
                />
              </div>
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
                  placeholder="+91"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email ID</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02]"
            >
              Save Profile
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-red-200 rounded-lg shadow-sm text-lg font-medium text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}