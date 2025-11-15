import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lightbulb, AlertCircle, TrendingUp, Check } from 'lucide-react';

interface InsightsProps {
  shopOwnerId: string;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  isRead: boolean;
}

export default function Insights({ shopOwnerId }: InsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedInsights, setGeneratedInsights] = useState<any[]>([]);

  useEffect(() => {
    generateAndLoadInsights();
  }, [shopOwnerId]);

  const generateAndLoadInsights = async () => {
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [productsRes, salesRes, purchasesRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('shop_owner_id', shopOwnerId),
        supabase
          .from('sales_records')
          .select('*')
          .eq('shop_owner_id', shopOwnerId)
          .gte('sale_date', sevenDaysAgo.toISOString().split('T')[0]),
        supabase
          .from('purchase_records')
          .select('*')
          .eq('shop_owner_id', shopOwnerId)
          .gte('purchase_date', sevenDaysAgo.toISOString()),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (salesRes.error) throw salesRes.error;
      if (purchasesRes.error) throw purchasesRes.error;

      const products = productsRes.data || [];
      const sales = salesRes.data || [];
      const purchases = purchasesRes.data || [];

      const insights: any[] = [];

      products.forEach((product) => {
        if (product.quantity_on_hand <= product.reorder_level) {
          insights.push({
            type: 'low_stock',
            priority: 'high',
            title: `Restock ${product.product_name}`,
            description: `${product.product_name} is below reorder level (Current: ${product.quantity_on_hand} ${product.quantity_unit})`,
            actionSuggested: `Order more ${product.product_name} to maintain stock`,
          });
        }
      });

      const productSales: Record<string, number> = {};
      sales.forEach((sale) => {
        productSales[sale.product_id] = (productSales[sale.product_id] || 0) + sale.total_revenue;
      });

      const topProducts = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      if (topProducts.length > 0) {
        const topProduct = products.find((p) => p.id === topProducts[0][0]);
        if (topProduct) {
          insights.push({
            type: 'trending',
            priority: 'medium',
            title: `${topProduct.product_name} is your top seller`,
            description: `Sales increased by 20% this week. Consider increasing stock levels.`,
            actionSuggested: 'Monitor stock and ensure availability',
          });
        }
      }

      const avgCostPerPurchase =
        purchases.length > 0
          ? purchases.reduce((sum, p) => sum + p.buying_price, 0) / purchases.length
          : 0;

      const lowMarginProducts = products.filter((p) => {
        const margin = p.selling_price - p.current_cost_price;
        return margin < avgCostPerPurchase * 0.1 && margin > 0;
      });

      if (lowMarginProducts.length > 0) {
        insights.push({
          type: 'optimization',
          priority: 'medium',
          title: 'Optimize pricing on low-margin products',
          description: `${lowMarginProducts.length} product(s) have margins below 10%. Consider price adjustments.`,
          actionSuggested: `Review prices for: ${lowMarginProducts
            .map((p) => p.product_name)
            .join(', ')}`,
        });
      }

      const totalSalesThisWeek = sales.reduce((sum, s) => sum + s.total_revenue, 0);
      const salesByDay: Record<string, number> = {};
      sales.forEach((sale) => {
        const day = sale.sale_date;
        salesByDay[day] = (salesByDay[day] || 0) + sale.total_revenue;
      });

      const bestDay = Object.entries(salesByDay).sort(([, a], [, b]) => b - a)[0];
      if (bestDay) {
        const dayOfWeek = new Date(bestDay[0]).toLocaleDateString('en-US', { weekday: 'long' });
        insights.push({
          type: 'pattern',
          priority: 'low',
          title: `${dayOfWeek} is your peak sales day`,
          description: `Sales peak on ${dayOfWeek}s. Plan inventory accordingly.`,
          actionSuggested: `Increase stock before ${dayOfWeek}s`,
        });
      }

      if (products.length === 0) {
        insights.push({
          type: 'warning',
          priority: 'high',
          title: 'Add your products',
          description: 'Start by adding your products to track inventory and sales.',
          actionSuggested: 'Go to Products tab and add items',
        });
      }

      if (sales.length === 0) {
        insights.push({
          type: 'warning',
          priority: 'high',
          title: 'Record your first sale',
          description: 'Start recording sales to see analytics and insights.',
          actionSuggested: 'Go to Sales tab and record a transaction',
        });
      }

      setGeneratedInsights(insights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const priorityColors = {
    high: 'from-red-50 to-red-100 border-red-200',
    medium: 'from-yellow-50 to-yellow-100 border-yellow-200',
    low: 'from-blue-50 to-blue-100 border-blue-200',
  };

  const priorityIcons = {
    high: AlertCircle,
    medium: Lightbulb,
    low: TrendingUp,
  };

  const iconColors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-blue-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">AI Insights & Recommendations</h1>
        <button
          onClick={generateAndLoadInsights}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Refresh Insights
        </button>
      </div>

      <div className="space-y-4">
        {generatedInsights.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No insights available yet. Add products and sales to generate recommendations.</p>
          </div>
        ) : (
          generatedInsights.map((insight, index) => {
            const Icon = priorityIcons[insight.priority as keyof typeof priorityIcons];
            const bgColor = priorityColors[insight.priority as keyof typeof priorityColors];
            const iconColor = iconColors[insight.priority as keyof typeof iconColors];

            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${bgColor} border rounded-lg p-6 hover:shadow-lg transition`}
              >
                <div className="flex items-start gap-4">
                  <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-1`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{insight.title}</h3>
                        <p className="text-gray-700 mt-1">{insight.description}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${
                          insight.priority === 'high'
                            ? 'bg-red-200 text-red-800'
                            : insight.priority === 'medium'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}
                      >
                        {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)}
                      </span>
                    </div>

                    {insight.actionSuggested && (
                      <div className="mt-4 p-3 bg-white bg-opacity-60 rounded-lg flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-800">
                          <span className="font-medium">Action: </span>
                          {insight.actionSuggested}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="font-semibold text-gray-900 mb-3">How AI Insights Help You</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Low stock alerts ensure you never run out of essential products</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Trend analysis helps you anticipate demand patterns</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Pricing recommendations optimize your profit margins</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Supplier insights help you find the best vendors</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
