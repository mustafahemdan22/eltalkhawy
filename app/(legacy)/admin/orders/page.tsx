'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { formatPrice, cn } from '@/lib/utils';
import { Search } from 'lucide-react';

const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_OPTIONS = [...STATUS_FLOW, 'cancelled'];

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

export default function AdminOrdersPage() {
  const orders = useQuery(api.orders.listAll);
  const updateStatus = useMutation(api.orders.updateStatus);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = orders
    ? orders.filter((o: any) => {
        const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filterStatus || o.status === filterStatus;
        return matchSearch && matchStatus;
      })
    : [];

  const handleStatusChange = async (orderId: string, status: string) => {
    await updateStatus({ orderId: orderId as any, status: status as any });
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream-100 mb-6">Orders</h1>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number..."
            className="w-full pl-10 pr-4 h-10 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 placeholder:text-charcoal-500 text-sm focus:outline-none focus:border-gold-500"
          />
        </div>
        <select
          value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 px-3 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 text-sm focus:outline-none focus:border-gold-500"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
          ))}
        </select>
      </div>

      {!orders ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-charcoal-500">No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-charcoal-800">
          <table className="w-full text-sm">
            <thead className="bg-charcoal-900 text-charcoal-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {filtered.map((o: any) => (
                <tr key={o._id} className="hover:bg-charcoal-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-cream-100 font-medium">{o.orderNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-cream-100">{o.deliveryAddress?.fullName || 'Guest'}</p>
                    <p className="text-charcoal-500 text-xs">{o.deliveryAddress?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-charcoal-300">{o.items?.length || 0}</td>
                  <td className="px-4 py-3 font-mono text-cream-100">EGP {formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      className={cn(
                        'text-xs px-2 py-1 rounded font-medium border-0 cursor-pointer appearance-none',
                        STATUS_STYLES[o.status] || 'bg-charcoal-800 text-charcoal-300',
                      )}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-charcoal-400 text-xs">
                    {new Date(o._creationTime).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
