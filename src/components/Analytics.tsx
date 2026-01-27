import { useState, useEffect } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { MetricCard } from './MetricCard';
import { TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

interface AnalyticsProps {
  shopData: {
    shop_name: string;
    business_type: string;
  };
  products: any[];
}

export default function Analytics({ shopData, products }: AnalyticsProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadTransactions();
  }, [shopData.shop_name, dateRange]);

  const loadTransactions = () => {
    try {
      const savedTransactions = localStorage.getItem(`transactions_${shopData.shop_name}`);
      if (savedTransactions) {
        let filteredTransactions = JSON.parse(savedTransactions);

        // Safety check: Ensure it's an array
        if (!Array.isArray(filteredTransactions)) {
          console.error("Invalid transaction data found");
          setTransactions([]);
          return;
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);

        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);

        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        if (dateRange === 'week') {
          filteredTransactions = filteredTransactions.filter((t: any) => new Date(t.date) >= oneWeekAgo);
        } else if (dateRange === 'month') {
          filteredTransactions = filteredTransactions.filter((t: any) => new Date(t.date) >= oneMonthAgo);
        } else if (dateRange === 'year') {
          filteredTransactions = filteredTransactions.filter((t: any) => new Date(t.date) >= oneYearAgo);
        }
        setTransactions(filteredTransactions);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      setTransactions([]);
    }
  };

  const calculateMetrics = () => {
    // Safety check
    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    const safeProducts = Array.isArray(products) ? products : [];

    const totalSales = safeTransactions.reduce((sum, t) => sum + (t.revenue || 0), 0);
    const totalProfit = safeTransactions.reduce((sum, t) => {
      const product = safeProducts.find(p => p.id === t.productId);
      return product ? sum + ((t.revenue || 0) - ((t.quantity || 0) * (product.current_cost_price || 0))) : sum;
    }, 0);

    const dailySalesMap = new Map<string, number>();
    safeTransactions.forEach(t => {
      if (!t.date) return;
      const date = new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dailySalesMap.set(date, (dailySalesMap.get(date) || 0) + (t.revenue || 0));
    });

    const dailyAverages = Array.from(dailySalesMap.values());
    const dailyAverage = dailyAverages.length > 0 ? dailyAverages.reduce((a, b) => a + b, 0) / dailyAverages.length : 0;

    const productSalesMap = new Map<string, number>();
    const productQuantityMap = new Map<string, number>();

    safeTransactions.forEach(t => {
      const productName = t.productName || 'Unknown';
      productSalesMap.set(productName, (productSalesMap.get(productName) || 0) + (t.revenue || 0));
      productQuantityMap.set(productName, (productQuantityMap.get(productName) || 0) + (t.quantity || 0));
    });

    const sortedProducts = Array.from(productSalesMap.entries()).sort((a, b) => b[1] - a[1]);
    const topProduct = sortedProducts.length > 0 ? sortedProducts[0][0] : 'N/A';

    const topProductsList = sortedProducts.slice(0, 5).map(([name, revenue], index) => ({
      rank: index + 1,
      name,
      revenue,
      quantity: productQuantityMap.get(name) || 0
    }));

    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const itemsSoldToday = safeTransactions
      .filter(t => t.date && new Date(t.date).toDateString() === today)
      .reduce((sum, t) => sum + (t.quantity || 0), 0);

    const itemsSoldMonth = safeTransactions
      .filter(t => {
        if (!t.date) return false;
        const d = new Date(t.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum, t) => sum + (t.quantity || 0), 0);

    return { totalSales, totalProfit, dailyAverage, topProduct, dailySalesMap, productSalesMap, topProductsList, itemsSoldToday, itemsSoldMonth };
  };

  const { totalSales, totalProfit, dailyAverage, topProduct, dailySalesMap, productSalesMap, topProductsList, itemsSoldToday, itemsSoldMonth } = calculateMetrics();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#9ca3af', font: { size: 11, family: "'Inter', sans-serif" } }
      },
      y: {
        grid: { color: '#f3f4f6', borderDash: [4, 4], drawBorder: false },
        ticks: {
          color: '#9ca3af',
          font: { size: 11, family: "'Inter', sans-serif" },
          callback: function (value: any) {
            return '₹' + value;
          }
        }
      }
    },
    elements: {
      line: { tension: 0.4 },
      point: { radius: 0, hoverRadius: 6 }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  const lineChartData = {
    labels: Array.from(dailySalesMap.keys()),
    datasets: [{
      label: 'Revenue',
      data: Array.from(dailySalesMap.values()),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)', // Solid color for stability
      fill: true,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#3b82f6',
      pointBorderWidth: 2,
      tension: 0.4
    }]
  };

  const productDistributionData = {
    labels: Array.from(productSalesMap.keys()),
    datasets: [{
      data: Array.from(productSalesMap.values()),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
      borderWidth: 0,
      hoverOffset: 4
    }],
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1">Track your business performance and growth.</p>
        </div>
        <div className="bg-gray-100 p-1 rounded-xl flex space-x-1">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range as any)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${dateRange === range
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Sales" value={`₹${totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} icon={<DollarSign className="w-6 h-6 text-white" />} color="from-blue-600 to-indigo-600" description="Revenue earned" />
        <MetricCard label="Total Profit" value={`₹${totalProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} icon={<TrendingUp className="w-6 h-6 text-white" />} color="from-emerald-500 to-teal-500" description="Net earnings" />
        <MetricCard label="Daily Average" value={`₹${dailyAverage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} icon={<Calendar className="w-6 h-6 text-white" />} color="from-violet-500 to-purple-500" description="Per day average" />
        <MetricCard label="Top Product" value={topProduct} icon={<Package className="w-6 h-6 text-white" />} color="from-orange-500 to-red-500" description="Best performer" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Trend Line Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><TrendingUp size={20} /></div>
                Revenue Trend
              </h3>
            </div>
            <div className="h-72">
              <Line options={chartOptions} data={lineChartData} />
            </div>
          </div>

          {/* Sales Distribution Bar Chart Alternative (if needed later) or keep Pie below */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Sales Distribution</h3>
            <div className="h-64 flex justify-center items-center">
              {Array.from(productSalesMap.keys()).length > 0 ? (
                <div className="w-full max-w-md">
                  <Pie data={productDistributionData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { usePointStyle: true, font: { family: "'Inter', sans-serif" } } } } }} />
                </div>
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <Package size={48} className="mb-2 opacity-20" />
                  <p>No product sales data found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -ml-16 -mb-16"></div>

            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 relative z-10">
              <span className="text-2xl">🏆</span> Leaderboard
            </h3>

            <div className="space-y-4 relative z-10">
              {topProductsList.length > 0 ? (
                topProductsList.map((product, index) => (
                  <div key={index} className="group relative bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-100'}`}></div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shadow-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' : index === 1 ? 'bg-gray-100 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'}`}>
                          {product.rank}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{product.name}</p>
                          <p className="text-xs text-gray-500 font-medium">{product.quantity} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{product.revenue.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-green-500 font-medium">+{(product.revenue / (totalSales || 1) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>No sales data to rank yet.</p>
                </div>
              )}
            </div>

            <div className="mt-8 bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Items Sold Today</span>
                <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded shadow-sm">Live</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-blue-900">{itemsSoldToday}</span>
                <span className="text-sm text-blue-600 mb-1">vs {itemsSoldMonth} this month</span>
              </div>
              <div className="w-full bg-blue-200 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((itemsSoldToday / (itemsSoldMonth || 1)) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
