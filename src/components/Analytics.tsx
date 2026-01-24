import { BarChart3, TrendingUp, PieChart, Calendar } from 'lucide-react';

interface AnalyticsProps {
  shopData: {
    shop_name: string;
    business_type: string;
  };
}

export default function Analytics({ shopData }: AnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-lg p-6 border border-indigo-200">
          <p className="text-indigo-600 text-sm font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Sales Analytics
          </p>
          <p className="text-2xl font-bold text-indigo-900 mt-3">Coming Soon</p>
          <p className="text-sm text-indigo-700 mt-2">Revenue trends & patterns</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-lg p-6 border border-emerald-200">
          <p className="text-emerald-600 text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Profit Analysis
          </p>
          <p className="text-2xl font-bold text-emerald-900 mt-3">Coming Soon</p>
          <p className="text-sm text-emerald-700 mt-2">Profitability insights</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-lg p-6 border border-amber-200">
          <p className="text-amber-600 text-sm font-medium flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Inventory Analysis
          </p>
          <p className="text-2xl font-bold text-amber-900 mt-3">Coming Soon</p>
          <p className="text-sm text-amber-700 mt-2">Stock performance data</p>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 text-center border border-white/50">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics Coming Soon!</h3>
        <p className="text-gray-600 max-w-lg mx-auto mb-6">
          Get detailed insights into your business performance with comprehensive analytics including:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
          <div className="text-left p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">📊 Sales Reports</h4>
            <p className="text-sm text-gray-600">Daily, weekly, and monthly sales trends</p>
          </div>
          <div className="text-left p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">💰 Profit Analysis</h4>
            <p className="text-sm text-gray-600">Product-wise profitability insights</p>
          </div>
          <div className="text-left p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">📈 Growth Metrics</h4>
            <p className="text-sm text-gray-600">Business growth tracking over time</p>
          </div>
          <div className="text-left p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">🎯 Performance KPIs</h4>
            <p className="text-sm text-gray-600">Key performance indicators dashboard</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
          <p className="text-sm text-indigo-800">
            <strong>Shop:</strong> {shopData.shop_name} | <strong>Type:</strong> {shopData.business_type}
          </p>
        </div>
      </div>
    </div>
  );
}