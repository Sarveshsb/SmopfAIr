import { useState, useEffect } from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, ArrowRight, Volume2 } from 'lucide-react';

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
  const [expenses, setExpenses] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    loadTransactions();
    loadExpenses();
    loadSuppliers();
  }, [shopData.shop_name]);

  const loadTransactions = () => {
    const savedTransactions = localStorage.getItem(`transactions_${shopData.shop_name}`);
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  };

  const loadExpenses = () => {
    const savedExpenses = localStorage.getItem(`expenses_${shopData.shop_name}`);
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  };

  const loadSuppliers = () => {
    const savedSuppliers = localStorage.getItem(`suppliers_${shopData.shop_name}`);
    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers));
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
      case 'expenses':
        onTabChange('expenses');
        break;
      case 'sell':
        onTabChange('sales');
        break;
      default:
        break;
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const getInsights = () => {
    const insights = [];

    // Low Stock Alerts with Supplier Integration
    const lowStockProducts = products.filter(p => p.quantity_on_hand <= p.reorder_level);
    if (lowStockProducts.length > 0) {
      const topLowStock = lowStockProducts[0];
      const linkedSuppliers = suppliers.filter(s => s.product_ids?.includes(topLowStock.id))
        .sort((a, b) => (b.reliability_score || 0) - (a.reliability_score || 0));

      let supplierMessage = "";
      if (linkedSuppliers.length > 0) {
        const bestSupplier = linkedSuppliers[0];
        supplierMessage = ` We recommend restocking from "${bestSupplier.supplier_name}" (Reliability: ${bestSupplier.reliability_score}/10).`;
      } else {
        supplierMessage = " No linked suppliers found for this product. Consider adding one in the Suppliers tab.";
      }

      insights.push({
        id: 'low-stock',
        type: 'alert',
        title: '⚠️ Low Stock Alert',
        message: `${lowStockProducts.length} products are running low (e.g., ${topLowStock.product_name}).${supplierMessage}`,
        actionLabel: linkedSuppliers.length > 0 ? 'Restock Now' : 'Manage Suppliers',
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

    // Expense-Based Insights (only when expense data exists)
    if (expenses.length >= 7) {
      const totalSales = transactions.reduce((sum, t) => sum + (t.revenue || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      // High Expense Alert
      if (totalSales > 0 && (totalExpenses / totalSales) > 0.7) {
        const percentage = ((totalExpenses / totalSales) * 100).toFixed(0);
        insights.push({
          id: 'high-expenses',
          type: 'alert',
          title: '⚠️ High Expenses Detected',
          message: `Your expenses (₹${totalExpenses.toLocaleString()}) are eating into profits. You're spending ${percentage}% of what you earn. Consider reviewing your costs.`,
          actionLabel: 'View Expenses',
          actionType: 'expenses',
        });
      }

      // Expense Category Analysis
      const categoryMap = new Map<string, number>();
      expenses.forEach(e => {
        categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount);
      });
      const sortedCategories = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]);

      if (sortedCategories.length > 0 && sortedCategories[0][1] / totalExpenses > 0.5) {
        const [category, amount] = sortedCategories[0];
        const percentage = ((amount / totalExpenses) * 100).toFixed(0);
        insights.push({
          id: 'category-dominant',
          type: 'info',
          title: '📊 Expense Pattern',
          message: `${category} accounts for ${percentage}% of your expenses (₹${amount.toLocaleString()}). This is your biggest cost area.`,
          actionLabel: 'Review Expenses',
          actionType: 'expenses',
        });
      }

      // Profit Improvement Opportunity
      if (sortedCategories.length > 0) {
        const [topCategory, topAmount] = sortedCategories[0];
        const savingsPotential = topAmount * 0.1;
        if (savingsPotential > 100) {
          insights.push({
            id: 'profit-opportunity',
            type: 'success',
            title: '💡 Profit Boost Tip',
            message: `Reducing ${topCategory} costs by just 10% would boost your profit by ₹${savingsPotential.toLocaleString()}!`,
            actionLabel: 'Analyze Expenses',
            actionType: 'expenses',
          });
        }
      }
    } else if (expenses.length === 0) {
      // Encourage expense tracking
      insights.push({
        id: 'track-expenses',
        type: 'info',
        title: '📝 Track Your Expenses',
        message: 'Start recording daily expenses like rent, electricity, and wages to get accurate profit insights and smarter recommendations!',
        actionLabel: 'Start Tracking',
        actionType: 'expenses',
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speak(`${insight.title}. ${insight.message}`)}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-500 transition-colors"
                    title="Listen to insight"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${insight.type === 'alert' ? 'bg-red-50 text-red-700 border border-red-100' :
                    insight.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                    {insight.type === 'alert' ? 'Critical' : insight.type === 'success' ? 'Opportunity' : 'Tip'}
                  </span>
                </div>
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