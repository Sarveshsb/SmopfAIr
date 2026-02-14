import React, { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { DollarSign, Wallet, TrendingUp, Calendar, Package, AlertCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

interface AnalyticsProps {
  shopData: {
    shop_name: string;
    business_type: string;
  };
  products: any[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ shopData, products }) => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    const savedTransactions = localStorage.getItem(`transactions_${shopData.shop_name}`);
    const savedExpenses = localStorage.getItem(`expenses_${shopData.shop_name}`);

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, [shopData.shop_name]);

  const calculateMetrics = () => {
    const now = new Date();
    let startDate: Date;

    if (dateRange === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const filteredTransactions = transactions.filter(t => new Date(t.date) >= startDate);
    const filteredExpenses = expenses.filter(e => new Date(e.date) >= startDate);

    const totalSales = filteredTransactions.reduce((sum, t) => sum + t.revenue, 0);
    const totalCosts = filteredTransactions.reduce((sum, t) => sum + (t.cost || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalProfit = totalSales - totalCosts - totalExpenses;

    const daysDiff = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyAverage = totalSales / daysDiff;

    const dailySalesMap = new Map<string, number>();
    filteredTransactions.forEach(t => {
      const date = new Date(t.date).toLocaleDateString();
      dailySalesMap.set(date, (dailySalesMap.get(date) || 0) + t.revenue);
    });

    const productSalesMap = new Map<string, number>();
    filteredTransactions.forEach(t => {
      productSalesMap.set(t.productName, (productSalesMap.get(t.productName) || 0) + t.revenue);
    });

    const expenseCategoryMap = new Map<string, number>();
    filteredExpenses.forEach(e => {
      expenseCategoryMap.set(e.category, (expenseCategoryMap.get(e.category) || 0) + e.amount);
    });

    const topProductsList = Array.from(productSalesMap.entries())
      .map(([name, revenue]) => {
        const quantity = filteredTransactions
          .filter(t => t.productName === name)
          .reduce((sum, t) => sum + t.quantity, 0);
        return { name, revenue, quantity };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const today = new Date().toDateString();
    const itemsSoldToday = filteredTransactions
      .filter(t => new Date(t.date).toDateString() === today)
      .reduce((sum, t) => sum + (t.quantity || 0), 0);

    return { totalSales, totalExpenses, totalProfit, dailyAverage, dailySalesMap, productSalesMap, expenseCategoryMap, topProductsList, itemsSoldToday };
  };

  const { totalSales, totalExpenses, totalProfit, dailyAverage, dailySalesMap, productSalesMap, expenseCategoryMap, topProductsList, itemsSoldToday } = calculateMetrics();

  // Growth & Clarity Chart Configuration
  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#F8FAFC',
        bodyColor: '#F8FAFC',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        displayColors: true,
        cornerRadius: 8,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
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
        grid: { display: false },
        ticks: {
          color: '#64748B',
          font: { size: 11, family: "'Inter', sans-serif", weight: 500 }
        }
      },
      y: {
        grid: { color: '#E2E8F0', borderDash: [4, 4], drawBorder: false },
        ticks: {
          color: '#64748B',
          font: { size: 11, family: "'Inter', sans-serif", weight: 500 },
          callback: function (value: any) {
            return '₹' + (value >= 1000 ? (value / 1000) + 'k' : value);
          }
        }
      }
    },
    elements: {
      line: { tension: 0.4, borderWidth: 3 },
      point: { radius: 0, hoverRadius: 6, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#fff' }
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
      borderColor: '#10B981', // Emerald Green
      backgroundColor: (context: any) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        return gradient;
      },
      fill: true,
      pointBackgroundColor: '#10B981',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }]
  };

  const vibrantPalette = ['#10B981', '#34D399', '#6EE7B7', '#059669', '#047857']; // Emerald shades

  const productDistributionData = {
    labels: Array.from(productSalesMap.keys()),
    datasets: [{
      data: Array.from(productSalesMap.values()),
      backgroundColor: vibrantPalette,
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverOffset: 8
    }],
  };

  const expenseDistributionData = {
    labels: Array.from(expenseCategoryMap.keys()),
    datasets: [{
      data: Array.from(expenseCategoryMap.values()),
      backgroundColor: ['#EF4444', '#F87171', '#FCA5A5', '#B91C1C', '#991B1B'], // Red shades for expenses
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverOffset: 8
    }],
  };

  return (
    <div className="min-h-screen relative pb-10 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8 pt-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Analytics Overview
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Your business performance at a glance.</p>
          </div>

          {/* Toggles */}
          <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex space-x-1">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range as any)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-all duration-200 ${dateRange === range
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Stats Cards - Clean Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 p-6 flex flex-col justify-between hover:border-emerald-200 transition-colors duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">₹{totalSales.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 p-6 flex flex-col justify-between hover:border-red-200 transition-colors duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                <Wallet className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">+5%</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Expenses</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">₹{totalExpenses.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 p-6 flex flex-col justify-between hover:border-indigo-200 transition-colors duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">+8%</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Net Profit</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">₹{totalProfit.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 p-6 flex flex-col justify-between hover:border-blue-200 transition-colors duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Daily Average</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">₹{dailyAverage.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">

            {/* Revenue Trend Line Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  Revenue Growth
                </h3>
                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Live Updates
                </div>
              </div>
              <div className="h-80 w-full">
                <Line options={chartOptions} data={lineChartData} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sales Distribution */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                  Product Mix
                </h3>
                <div className="h-56 flex justify-center items-center">
                  {Array.from(productSalesMap.keys()).length > 0 ? (
                    <div className="w-full">
                      <Pie data={productDistributionData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, usePointStyle: true, font: { size: 11, family: "'Inter', sans-serif" } } } } }} />
                    </div>
                  ) : (
                    <div className="text-slate-300 flex flex-col items-center">
                      <Package size={32} className="mb-2 opacity-50" />
                      <p className="text-xs font-medium">No Data</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Expense Distribution */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                  Expense Split
                </h3>
                <div className="h-56 flex justify-center items-center">
                  {expenses.length > 0 ? (
                    <div className="w-full">
                      <Pie data={expenseDistributionData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, usePointStyle: true, font: { size: 11, family: "'Inter', sans-serif" } } } } }} />
                    </div>
                  ) : (
                    <div className="text-slate-300 flex flex-col items-center">
                      <AlertCircle size={32} className="mb-2 opacity-50" />
                      <p className="text-xs font-medium">No Data</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  🏆 Top Performers
                </h3>
              </div>

              <div className="p-4 flex-grow overflow-y-auto">
                <div className="space-y-3">
                  {topProductsList.length > 0 ? (
                    topProductsList.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm truncate max-w-[120px]">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.quantity} units</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 text-sm">₹{product.revenue.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400 font-medium text-sm">
                      No sales data yet
                    </div>
                  )}
                </div>
              </div>

              {/* Today's Stats Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Daily Volume</span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-slate-900 tracking-tight">{itemsSoldToday}</span>
                  <span className="text-sm text-slate-500 mb-2 font-medium">items sold today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
