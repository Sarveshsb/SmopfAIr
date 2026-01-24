import { Lightbulb, Brain, Target, Zap } from 'lucide-react';

interface InsightsProps {
  shopData: {
    shop_name: string;
    business_type: string;
  };
}

export default function Insights({ shopData }: InsightsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200">
          <p className="text-purple-600 text-sm font-medium flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Smart Recommendations
          </p>
          <p className="text-2xl font-bold text-purple-900 mt-3">Coming Soon</p>
          <p className="text-sm text-purple-700 mt-2">AI-driven business advice</p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl shadow-lg p-6 border border-rose-200">
          <p className="text-rose-600 text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            Optimization Tips
          </p>
          <p className="text-2xl font-bold text-rose-900 mt-3">Coming Soon</p>
          <p className="text-sm text-rose-700 mt-2">Performance improvements</p>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 text-center border border-white/50">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Lightbulb className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Insights Coming Soon!</h3>
        <p className="text-gray-600 max-w-lg mx-auto mb-6">
          Get personalized AI-powered recommendations to grow your {shopData.business_type.toLowerCase()} business:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
          <div className="text-left p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Smart Pricing</h4>
            </div>
            <p className="text-sm text-blue-700">AI suggests optimal prices based on market trends and competition</p>
          </div>
          
          <div className="text-left p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Demand Forecasting</h4>
            </div>
            <p className="text-sm text-green-700">Predict which products will be in high demand next month</p>
          </div>
          
          <div className="text-left p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-purple-900">Inventory Optimization</h4>
            </div>
            <p className="text-sm text-purple-700">Get smart recommendations on when to reorder stock</p>
          </div>
          
          <div className="text-left p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-orange-600" />
              <h4 className="font-semibold text-orange-900">Growth Tips</h4>
            </div>
            <p className="text-sm text-orange-700">Personalized advice to increase sales and profitability</p>
          </div>
          
          <div className="text-left p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-teal-600" />
              <h4 className="font-semibold text-teal-900">Seasonal Trends</h4>
            </div>
            <p className="text-sm text-teal-700">Understand seasonal patterns for better planning</p>
          </div>
          
          <div className="text-left p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-pink-600" />
              <h4 className="font-semibold text-pink-900">Customer Insights</h4>
            </div>
            <p className="text-sm text-pink-700">Understand customer preferences and buying patterns</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Shop:</strong> {shopData.shop_name} | <strong>Type:</strong> {shopData.business_type}
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            AI recommendations will be tailored specifically for your business type
          </p>
        </div>
      </div>
    </div>
  );
}