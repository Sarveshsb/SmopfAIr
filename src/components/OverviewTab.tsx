import React, { useEffect, useState } from 'react';
import { WelcomeHero, StatCard, QuickActionCard, ActivityItem } from './OverviewTabComponents';
import { DollarSign, Package, ShoppingCart, Users, Plus, TrendingUp, BarChart3, Truck } from 'lucide-react';

interface OverviewTabProps {
  shopData: {
    shop_name: string;
    business_type: string;
  };
  products: any[];
  onTabChange: (tab: any) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ shopData, products, onTabChange }) => {
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Load Transactions
    const savedTransactions = localStorage.getItem(`transactions_${shopData.shop_name}`);
    if (savedTransactions) {
      const transactions = JSON.parse(savedTransactions);

      // Calculate Today's Metrics
      const today = new Date().toDateString();
      const todaysTransactions = transactions.filter((t: any) => new Date(t.date).toDateString() === today);

      setTodayRevenue(todaysTransactions.reduce((sum: number, t: any) => sum + t.revenue, 0));
      setTodayOrders(todaysTransactions.length);

      // Unique Customers (mock logic based on transactions for now, as we don't have a distinct customer DB yet)
      // In a real app, this would query a customers table.
      setTotalCustomers(new Set(transactions.map((t: any) => t.date)).size * 2); // Simulating customer count based on activity

      // Recent Activity (Top 5)
      setRecentActivity(transactions.slice(-5).reverse());
    }
  }, [shopData.shop_name, products]);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* 1. Hero Section */}
      <WelcomeHero shopName={shopData.shop_name} />

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Today's Revenue"
          value={`₹${todayRevenue.toLocaleString('en-IN')}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="emerald"
          trend="12% vs yesterday"
        />
        <StatCard
          label="Orders Today"
          value={todayOrders.toString()}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="blue"
          trend="New orders"
        />
        <StatCard
          label="Total Products"
          value={products.length.toString()}
          icon={<Package className="w-6 h-6" />}
          color="violet"
          trend="In stock"
        />
        <StatCard
          label="Total Customers"
          value={totalCustomers.toString()} // Placeholder logic
          icon={<Users className="w-6 h-6" />}
          color="orange"
          trend=" growing"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            🚀 Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickActionCard
              label="Add New Product"
              description="Add items to your inventory to start selling."
              icon={<Plus className="w-6 h-6" />}
              color="blue"
              onClick={() => onTabChange('products')}
            />
            <QuickActionCard
              label="Record New Sale"
              description="Log a transaction and update your revenue."
              icon={<TrendingUp className="w-6 h-6" />}
              color="emerald"
              onClick={() => onTabChange('sales')}
            />
            <QuickActionCard
              label="Manage Suppliers"
              description="View and manage your vendor connections."
              icon={<Truck className="w-6 h-6" />}
              color="orange"
              onClick={() => onTabChange('suppliers')}
            />
            <QuickActionCard
              label="View Analytics"
              description="Deep dive into your business performance."
              icon={<BarChart3 className="w-6 h-6" />}
              color="violet"
              onClick={() => onTabChange('analytics')}
            />
          </div>
        </div>

        {/* 4. Recent Activity Feed */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-full">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🕒 Recent Activity
          </h2>
          <div className="space-y-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <ActivityItem
                  key={index}
                  title={`Sold ${activity.productName}`}
                  subtitle={`${activity.quantity} units`}
                  amount={`+₹${activity.revenue.toLocaleString()}`}
                  time={new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  icon={<ShoppingCart className="w-5 h-5" />}
                  color="emerald"
                />
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                <p>No recent activity.</p>
                <button onClick={() => onTabChange('sales')} className="text-blue-600 text-sm font-medium mt-2 hover:underline">Record a sale</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};