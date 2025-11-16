import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Package, DollarSign, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsProps {
  shopOwnerId: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function Analytics({ shopOwnerId }: AnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [dailySales, setDailySales] = useState<any[]>([]);
  const [productSales, setProductSales] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    avgRevenue: 0,
    topProduct: '',
  });
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadAnalytics();
  }, [shopOwnerId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - (timeRange === 'week' ? 7 : 30));

      const [salesRes, productsRes, expensesRes] = await Promise.all([
        supabase
          .from('sales_records')
          .select('sale_date, total_revenue, quantity_sold, product_id')
          .eq('shop_owner_id', shopOwnerId)
          .gte('sale_date', startDate.toISOString().split('T')[0]),
        supabase
          .from('products')
          .select('id, product_name, current_cost_price'),
        supabase
          .from('expenses')
          .select('amount')
          .eq('shop_owner_id', shopOwnerId)
          .gte('expense_date', startDate.toISOString().split('T')[0]),
      ]);

      if (salesRes.error || productsRes.error || expensesRes.error) {
        throw new Error('Failed to load analytics data');
      }

      const sales = salesRes.data || [];
      const products = productsRes.data || [];
      const expenses = expensesRes.data || [];

      const dailyMap: Record<string, number> = {};
      sales.forEach((s: any) => {
        dailyMap[s.sale_date] = (dailyMap[s.sale_date] || 0) + s.total_revenue;
      });

      const dailyChartData = Object.entries(dailyMap)
        .map(([date, revenue]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: Math.round((revenue as number) * 100) / 100,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setDailySales(dailyChartData);

      const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
      sales.forEach((s: any) => {
        const product = products.find((p: any) => p.id === s.product_id);
        if (product) {
          if (!productMap[s.product_id]) {
            productMap[s.product_id] = { name: product.product_name, quantity: 0, revenue: 0 };
          }
          productMap[s.product_id].quantity += s.quantity_sold;
          productMap[s.product_id].revenue += s.total_revenue;
        }
      });

      const productChartData = Object.values(productMap)
        .map((p: any) => ({
          name: p.name,
          revenue: Math.round(p.revenue * 100) / 100,
          quantity: p.quantity,
        }))
        .sort((a, b) => b.revenue - a.revenue);

      setProductSales(productChartData);

      const totalRevenue = sales.reduce((sum: number, s: any) => sum + s.total_revenue, 0);
      const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

      setStats({
        totalSales: Math.round(totalRevenue * 100) / 100,
        totalProfit: Math.round((totalRevenue - totalExpenses) * 100) / 100,
        avgRevenue: dailyChartData.length > 0 ? Math.round((totalRevenue / dailyChartData.length) * 100) / 100 : 0,
        topProduct: productChartData.length > 0 ? productChartData[0].name : 'N/A',
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-300 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            <Calendar className="inline w-4 h-4 mr-2" />
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            <Calendar className="inline w-4 h-4 mr-2" />
            This Month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Sales</p>
              <p className="text-4xl font-bold mt-2">₹{stats.totalSales}</p>
              <p className="text-blue-200 text-xs mt-2">Revenue earned</p>
            </div>
            <DollarSign className="w-12 h-12 opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Profit</p>
              <p className="text-4xl font-bold mt-2">₹{stats.totalProfit}</p>
              <p className="text-green-200 text-xs mt-2">After expenses</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm font-medium">Daily Average</p>
              <p className="text-4xl font-bold mt-2">₹{stats.avgRevenue}</p>
              <p className="text-purple-200 text-xs mt-2">Per day average</p>
            </div>
            <DollarSign className="w-12 h-12 opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm font-medium">Top Product</p>
              <p className="text-2xl font-bold mt-2 truncate">{stats.topProduct}</p>
              <p className="text-orange-200 text-xs mt-2">Best performer</p>
            </div>
            <Package className="w-12 h-12 opacity-20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span> Revenue Trend
          </h2>
          {dailySales.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={dailySales} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    boxShadow: '0 10px 15px rgba(0, 0, 0, 0.3)',
                  }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500">
              <p>No sales data available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🥧</span> Sales Distribution
          </h2>
          {productSales.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={productSales.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name?.substring?.(0, 10)}: ₹${value}`}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {productSales.slice(0, 6).map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    boxShadow: '0 10px 15px rgba(0, 0, 0, 0.3)',
                  }}
                  formatter={(value) => `₹${value}`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500">
              <p>No product data</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🏆</span> Top Products by Revenue
          </h2>
          {productSales.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={productSales.slice(0, 8)} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    boxShadow: '0 10px 15px rgba(0, 0, 0, 0.3)',
                  }}
                  formatter={(value) => `₹${value}`}
                />
                <Bar dataKey="revenue" fill="#F59E0B" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500">
              <p>No product data</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span> Products Sold by Quantity
          </h2>
          {productSales.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={productSales.slice(0, 8)} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    boxShadow: '0 10px 15px rgba(0, 0, 0, 0.3)',
                  }}
                  formatter={(value) => `${value} units`}
                />
                <Bar dataKey="quantity" fill="#10B981" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500">
              <p>No quantity data</p>
            </div>
          )}
        </div>
      </div>

      {productSales.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">📋</span> Detailed Product Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="text-left py-4 px-4 text-gray-700 font-bold">Product</th>
                  <th className="text-right py-4 px-4 text-gray-700 font-bold">Quantity Sold</th>
                  <th className="text-right py-4 px-4 text-gray-700 font-bold">Total Revenue</th>
                  <th className="text-center py-4 px-4 text-gray-700 font-bold">Rank</th>
                </tr>
              </thead>
              <tbody>
                {productSales.map((product, index) => (
                  <tr key={product.name} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="font-semibold text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-600">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">{product.quantity.toFixed(0)} units</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-bold text-gray-900">₹{product.revenue.toFixed(0)}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
