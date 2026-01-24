import { IndianRupee, TrendingUp, Package, Calendar } from 'lucide-react';

interface SalesTrackingProps {
  shopData: {
    shop_name: string;
    business_type: string;
  };
}

export default function SalesTracking({ shopData }: SalesTrackingProps) {
  // Mock data for demonstration
  const todaysSales = 0;
  const transactions = 0;
  const productsSold = 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Daily Sales Tracking</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200">
          <p className="text-green-600 text-sm font-medium flex items-center gap-2">
            <IndianRupee className="w-4 h-4" />
            Today's Total Sales
          </p>
          <p className="text-4xl font-bold text-green-900 mt-3">₹{todaysSales.toFixed(2)}</p>
          <p className="text-sm text-green-700 mt-2 flex items-center gap-1">
            <span className="text-lg">📊</span> {transactions} transactions
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200">
          <p className="text-blue-600 text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Avg Transaction Value
          </p>
          <p className="text-4xl font-bold text-blue-900 mt-3">
            ₹{transactions > 0 ? (todaysSales / transactions).toFixed(0) : 0}
          </p>
          <p className="text-sm text-blue-700 mt-2 flex items-center gap-1">
            <span className="text-lg">💳</span> Per sale
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200">
          <p className="text-purple-600 text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4" />
            Products Sold
          </p>
          <p className="text-4xl font-bold text-purple-900 mt-3">{productsSold}</p>
          <p className="text-sm text-purple-700 mt-2 flex items-center gap-1">
            <span className="text-lg">📦</span> Units total
          </p>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 text-center border border-white/50">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Sales Tracking Coming Soon!</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          This feature will allow you to record daily sales, track revenue, and monitor your best-selling products. 
          Start by adding products in the Products section.
        </p>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Shop:</strong> {shopData.shop_name} | <strong>Type:</strong> {shopData.business_type}
          </p>
        </div>
      </div>
    </div>
  );
}