import { useState, useEffect } from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';

interface InsightsProps {
  shopData: {
    shop_name: string;
    business_type: string;
  };
  products: any[];
  onTabChange: (tab: any) => void;
}

export default function Insights({ shopData, products, onTabChange }: InsightsProps) {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadTransactions();
  }, [shopData.shop_name]);

  const loadTransactions = () => {
    const savedTransactions = localStorage.getItem(`transactions_${shopData.shop_name}`);
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  };

  const handleAction = (actionType: string) => {
    switch (actionType) {
      case 'restock':
        onTabChange('suppliers');
        break;
      case 'discount':
      case 'view_products':
        onTabChange('products');
        break;
      case 'analyze':
        onTabChange('analytics');
        break;
      case 'sell':
        onTabChange('sales');
        break;
      default:
        break;
    }
  };

  const getInsights = () => {
    const insights = [];

    // Low Stock Alerts
    const lowStockProducts = products.filter(p => p.quantity_on_hand <= p.reorder_level);
    if (lowStockProducts.length > 0) {
      insights.push({
        id: 'low-stock',
        type: 'alert',
        title: '⚠️ Low Stock Alert',
        message: `${lowStockProducts.length} products are running low (e.g., ${lowStockProducts[0].product_name}). Reorder soon to avoid losing sales.`,
        actionLabel: 'Restock Now',
        actionType: 'restock',
      });
    }

    // Top Selling Products
    const productSalesMap = new Map<string, number>();
    transactions.forEach(t => {
      productSalesMap.set(t.productName, (productSalesMap.get(t.productName) || 0) + t.quantity);
    });
    const sortedProducts = Array.from(productSalesMap.entries()).sort((a, b) => b[1] - a[1]);

    if (sortedProducts.length > 0) {
      insights.push({
        id: 'top-selling',
        type: 'success',
        title: '📈 Trending Product',
        message: `"${sortedProducts[0][0]}" is your best seller with ${sortedProducts[0][1]} units sold! consider increasing its stock.`,
        actionLabel: 'View Inventory',
        actionType: 'view_products',
      });
    }

    // Dead Stock Analysis (Products with inventory but no sales)
    const deadStock = products.filter(p => p.quantity_on_hand > 0 && !productSalesMap.has(p.product_name));
    if (deadStock.length > 0) {
      insights.push({
        id: 'dead-stock',
        type: 'info',
        title: '🐢 Slow Moving Inventory',
        message: `${deadStock.length} products haven't sold yet (e.g., ${deadStock[0].product_name}). Consider running a discount or promotion.`,
        actionLabel: 'Create Offer',
        actionType: 'discount',
      });
    }

    // Profit Optimization
    const highProfitProducts = products.filter(p => {
      const margin = p.selling_price - p.current_cost_price;
      return p.current_cost_price > 0 && (margin / p.current_cost_price) > 0.3;
    });
    if (highProfitProducts.length > 0) {
      insights.push({
        id: 'profit-opt',
        type: 'success',
        title: '💰 Profit Champions',
        message: `${highProfitProducts.length} items have >30% profit margin. Display them prominently to boost profits!`,
        actionLabel: 'View Products',
        actionType: 'view_products',
      });
    }

    if (insights.length === 0) {
      insights.push({
        id: 'no-insights',
        type: 'info',
        title: '💡 Gathering Data',
        message: 'Start recording sales to unlock AI-powered insights for your business growth!',
        actionLabel: 'Record Sale',
        actionType: 'sell',
      });
    }

    return insights;
  };

  const insightsList = getInsights();

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">AI Insights</h1>
          <p className="text-blue-100 opacity-90 text-sm mt-1">Smart recommendations to grow your business.</p>
        </div>
        <button
          onClick={() => loadTransactions()}
          className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
        >
          Refresh Analysis
        </button>
      </div>

      <div className="grid gap-4">
        {insightsList.map(insight => (
          <div key={insight.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col md:flex-row items-start gap-5 hover:shadow-md transition-shadow">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${insight.type === 'alert' ? 'bg-red-100 text-red-600' :
                insight.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-blue-100 text-blue-600'
              }`}>
              {insight.type === 'alert' ? <AlertTriangle className="w-6 h-6" /> :
                insight.type === 'success' ? <TrendingUp className="w-6 h-6" /> :
                  <Lightbulb className="w-6 h-6" />}
            </div>
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900">{insight.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${insight.type === 'alert' ? 'bg-red-50 text-red-700 border border-red-100' :
                    insight.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                  {insight.type === 'alert' ? 'Critical' : insight.type === 'success' ? 'Opportunity' : 'Tip'}
                </span>
              </div>
              <p className="text-gray-600 mt-2 mb-4 leading-relaxed">{insight.message}</p>

              {insight.actionLabel && (
                <button
                  onClick={() => handleAction(insight.actionType!)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all group ${insight.type === 'alert' ? 'bg-red-50 text-red-700 hover:bg-red-100' :
                      insight.type === 'success' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' :
                        'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                >
                  {insight.actionLabel}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 text-center shadow-xl">
        <p className="text-white/80 text-sm">
          Analysis based on <strong>{shopData.shop_name}</strong>'s store data.
        </p>
        <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider font-semibold">
          Powered by SmopfAIr Intelligence
        </p>
      </div>
    </div>
  );
}