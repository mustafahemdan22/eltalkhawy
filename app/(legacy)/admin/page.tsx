'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { formatPrice, cn } from '@/lib/utils';
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, Percent } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  delivered:  'bg-emerald-500/10 text-emerald-400',
  cancelled:  'bg-red-500/10 text-red-400',
  pending:    'bg-yellow-500/10 text-yellow-400',
  processing: 'bg-blue-500/10 text-blue-400',
  shipped:    'bg-cyan-500/10 text-cyan-400',
  confirmed:  'bg-green-500/10 text-green-400',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing',
  shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
};

export default function AdminDashboard() {
  const stats = useQuery(api.dashboard.stats);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Products',  value: stats.totalProducts,  icon: Package,     color: 'text-blue-400' },
    { label: 'Total Orders',    value: stats.totalOrders,    icon: ShoppingCart, color: 'text-emerald-400' },
    { label: 'Total Users',     value: stats.totalUsers,     icon: Users,        color: 'text-purple-400' },
    { label: 'Revenue',         value: `EGP ${formatPrice(stats.totalRevenue)}`, icon: TrendingUp, color: 'text-gold-400' },
    { label: 'Active Promos',   value: stats.totalPromoCodes, icon: Percent,     color: 'text-cyan-400' },
    { label: 'Low Stock Items', value: stats.lowStockProducts, icon: AlertTriangle, color: stats.lowStockProducts > 0 ? 'text-orange-400' : 'text-charcoal-500' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream-100 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-charcoal-400 font-medium">{label}</span>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-cream-100 font-mono">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-charcoal-900 border border-charcoal-800">
          <h2 className="font-semibold text-cream-100 mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {Object.entries(stats.ordersByStatus).map(([key, count]) => (
              <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-charcoal-300">{STATUS_LABELS[key] || key}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-charcoal-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-500 rounded-full transition-all"
                      style={{ width: `${stats.totalOrders ? (count / stats.totalOrders) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono text-cream-100 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-charcoal-900 border border-charcoal-800">
          <h2 className="font-semibold text-cream-100 mb-4">Recent Orders</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-charcoal-500">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order: any) => (
                <div key={order._id} className="flex items-center justify-between py-2 border-b border-charcoal-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-cream-100 font-mono">{order.orderNumber}</p>
                    <p className="text-xs text-charcoal-400">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''} · EGP {formatPrice(order.total)}
                    </p>
                  </div>
                  <span className={cn('text-xs px-2 py-1 rounded font-medium', STATUS_STYLES[order.status])}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
