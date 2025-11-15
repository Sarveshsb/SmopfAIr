import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Product {
  id: string;
  product_name: string;
  quantity_on_hand: number;
  selling_price: number;
}

interface SalesRecord {
  id: string;
  product_id: string;
  quantity_sold: number;
  selling_price: number;
  total_revenue: number;
  sale_date: string;
  product_name?: string;
}

interface SalesTrackingProps {
  shopOwnerId: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function SalesTracking({ shopOwnerId }: SalesTrackingProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity_sold: 1,
    selling_price: 0,
    sale_date: new Date().toISOString().split('T')[0],
  });
  const [todaySalesTotal, setTodaySalesTotal] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [productSalesData, setProductSalesData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [shopOwnerId]);

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [productsRes, salesRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('shop_owner_id', shopOwnerId),
        supabase
          .from('sales_records')
          .select('*')
          .eq('shop_owner_id', shopOwnerId)
          .eq('sale_date', today)
          .order('created_at', { ascending: false }),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (salesRes.error) throw salesRes.error;

      setProducts(productsRes.data || []);
      const salesWithProductNames = (salesRes.data || []).map((sale) => ({
        ...sale,
        product_name: productsRes.data?.find((p) => p.id === sale.product_id)
          ?.product_name,
      }));
      setSales(salesWithProductNames);

      const total = salesWithProductNames.reduce(
        (sum, sale) => sum + sale.total_revenue,
        0
      );
      setTodaySalesTotal(total);

      prepareChartData(salesWithProductNames);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (salesData: SalesRecord[]) => {
    const groupedByProduct: Record<string, { quantity: number; revenue: number }> = {};

    salesData.forEach((sale) => {
      if (!groupedByProduct[sale.product_name || '']) {
        groupedByProduct[sale.product_name || ''] = { quantity: 0, revenue: 0 };
      }
      groupedByProduct[sale.product_name || ''].quantity += sale.quantity_sold;
      groupedByProduct[sale.product_name || ''].revenue += sale.total_revenue;
    });

    const chartDataArray = Object.entries(groupedByProduct).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenue: data.revenue,
    }));

    setChartData(chartDataArray);
    setProductSalesData(chartDataArray);
  };

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const total_revenue =
        parseFloat(formData.quantity_sold.toString()) *
        parseFloat(formData.selling_price.toString());

      const { error: saleError } = await supabase
        .from('sales_records')
        .insert([
          {
            shop_owner_id: shopOwnerId,
            product_id: formData.product_id,
            quantity_sold: parseFloat(formData.quantity_sold.toString()),
            selling_price: parseFloat(formData.selling_price.toString()),
            total_revenue,
            sale_date: formData.sale_date,
          },
        ]);

      if (saleError) throw saleError;

      const product = products.find((p) => p.id === formData.product_id);
      if (product) {
        const newQuantity = product.quantity_on_hand - parseFloat(formData.quantity_sold.toString());
        const { error: updateError } = await supabase
          .from('products')
          .update({ quantity_on_hand: newQuantity })
          .eq('id', formData.product_id);

        if (updateError) throw updateError;
      }

      setFormData({
        product_id: '',
        quantity_sold: 1,
        selling_price: 0,
        sale_date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error adding sale:', error);
    }
  };

  const handleDeleteSale = async (saleId: string, productId: string, quantitySold: number) => {
    if (!confirm('Remove this sale?')) return;
    try {
      const { error: deleteError } = await supabase
        .from('sales_records')
        .delete()
        .eq('id', saleId);

      if (deleteError) throw deleteError;

      const product = products.find((p) => p.id === productId);
      if (product) {
        const newQuantity = product.quantity_on_hand + quantitySold;
        await supabase
          .from('products')
          .update({ quantity_on_hand: newQuantity })
          .eq('id', productId);
      }

      loadData();
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const selectedProduct = products.find((p) => p.id === formData.product_id);
  const topProducts = productSalesData.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Daily Sales Tracking</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record Sale</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200 transform hover:scale-105 transition-transform">
          <p className="text-green-600 text-sm font-medium">Today's Total Sales</p>
          <p className="text-4xl font-bold text-green-900 mt-3">₹{todaySalesTotal.toFixed(2)}</p>
          <p className="text-sm text-green-700 mt-2 flex items-center gap-1">
            <span className="text-lg">📊</span> {sales.length} transactions
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200 transform hover:scale-105 transition-transform">
          <p className="text-blue-600 text-sm font-medium">Avg Transaction Value</p>
          <p className="text-4xl font-bold text-blue-900 mt-3">
            ₹{sales.length > 0 ? (todaySalesTotal / sales.length).toFixed(0) : 0}
          </p>
          <p className="text-sm text-blue-700 mt-2 flex items-center gap-1">
            <span className="text-lg">💳</span> Per sale
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200 transform hover:scale-105 transition-transform">
          <p className="text-purple-600 text-sm font-medium">Products Sold</p>
          <p className="text-4xl font-bold text-purple-900 mt-3">
            {sales.reduce((sum, s) => sum + s.quantity_sold, 0).toFixed(0)}
          </p>
          <p className="text-sm text-purple-700 mt-2 flex items-center gap-1">
            <span className="text-lg">📦</span> Units total
          </p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Product</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => `₹${value.toFixed(0)}`}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ₹${value.toFixed(0)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => `₹${value.toFixed(0)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {topProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products Today</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topProducts.map((product, index) => (
              <div
                key={product.name}
                className={`bg-gradient-to-br rounded-lg p-4 text-white transform hover:scale-105 transition-transform ${
                  index === 0
                    ? 'from-yellow-500 to-yellow-600'
                    : index === 1
                    ? 'from-gray-400 to-gray-500'
                    : index === 2
                    ? 'from-orange-500 to-orange-600'
                    : 'from-blue-500 to-blue-600'
                }`}
              >
                <div className="text-2xl mb-2">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}</div>
                <p className="font-semibold truncate">{product.name}</p>
                <p className="text-sm opacity-90 mt-1">Revenue: ₹{product.revenue.toFixed(0)}</p>
                <p className="text-sm opacity-90">Qty: {product.quantity.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Record a Sale</h2>
          <form onSubmit={handleAddSale} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => {
                    const product = products.find((p) => p.id === e.target.value);
                    setFormData({
                      ...formData,
                      product_id: e.target.value,
                      selling_price: product?.selling_price || 0,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.product_name} (Stock: {product.quantity_on_hand})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Sold
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantity_sold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity_sold: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      selling_price: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Date
                </label>
                <input
                  type="date"
                  value={formData.sale_date}
                  onChange={(e) =>
                    setFormData({ ...formData, sale_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {selectedProduct && formData.quantity_sold && formData.selling_price && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{(formData.quantity_sold * formData.selling_price).toFixed(2)}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Record Sale
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Today's Transactions</h2>
        {sales.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No sales recorded for today.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sales.map((sale, index) => (
              <div
                key={sale.id}
                className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{sale.product_name}</p>
                    <p className="text-xs text-gray-500 mt-1">Transaction #{index + 1}</p>
                  </div>
                  <button
                    onClick={() =>
                      handleDeleteSale(sale.id, sale.product_id, sale.quantity_sold)
                    }
                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{sale.quantity_sold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="font-medium">₹{sale.selling_price}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Revenue:</span>
                    <span className="font-bold text-green-600">₹{sale.total_revenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
