import { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, TrendingUp, Package, CheckCircle, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'warning' | 'success' | 'info' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  actionable?: boolean;
  action?: string;
}

interface NotificationCenterProps {
  shopData: {
    shop_name: string;
    business_type: string;
  };
  products: any[];
}

export default function NotificationCenter({ shopData, products }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    generateNotifications();
  }, [products]);

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];

    // Low stock alerts
    const lowStockProducts = products.filter(p => p.quantity_on_hand <= p.reorder_level);
    if (lowStockProducts.length > 0) {
      newNotifications.push({
        id: 'low-stock-' + Date.now(),
        type: 'alert',
        title: '⚠️ Low Stock Alert',
        message: `${lowStockProducts.length} products are running low. Restock ${lowStockProducts.slice(0, 2).map(p => p.product_name).join(', ')}${lowStockProducts.length > 2 ? ' and others' : ''}.`,
        timestamp: new Date(),
        actionable: true,
        action: 'Reorder Now'
      });
    }

    // Sales insights
    if (products.length > 0) {
      newNotifications.push({
        id: 'sales-insight-' + Date.now(),
        type: 'info',
        title: '📊 AI Insights',
        message: `Your ${shopData.business_type.toLowerCase()} has ${products.length} products. Consider adding seasonal items for better sales.`,
        timestamp: new Date(),
        actionable: true,
        action: 'View Tips'
      });
    }

    // Daily motivation
    newNotifications.push({
      id: 'daily-tip-' + Date.now(),
      type: 'success',
      title: '💡 Daily Tip',
      message: 'Track your daily sales to identify your best-selling products and optimize inventory.',
      timestamp: new Date(),
      actionable: false
    });

    // Pricing optimization
    const highProfitProducts = products.filter(p => {
      const margin = p.selling_price - p.current_cost_price;
      return (margin / p.current_cost_price) > 0.3;
    });

    if (highProfitProducts.length > 0) {
      newNotifications.push({
        id: 'profit-optimization-' + Date.now(),
        type: 'info',
        title: '💰 Profit Optimization',
        message: `${highProfitProducts.length} products have good profit margins. Consider promoting them more.`,
        timestamp: new Date(),
        actionable: true,
        action: 'View Analysis'
      });
    }

    setNotifications(newNotifications);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <Package className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 max-w-sm bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white rounded-full transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">{shopData.shop_name}</p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">We'll notify you about important updates</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {notification.title}
                          </h4>
                          <button
                            onClick={() => dismissNotification(notification.id)}
                            className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full transition"
                          >
                            <X className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            {notification.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>

                          {notification.actionable && notification.action && (
                            <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition">
                              {notification.action}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setNotifications([])}
                className="w-full text-sm text-gray-600 hover:text-gray-800 transition"
              >
                Clear All Notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}