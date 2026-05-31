'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Plus, Edit3, Trash2 } from 'lucide-react';

const defaultPromo = {
  code: '', discountType: 'percentage' as 'percentage' | 'fixed',
  discountValue: 0, minOrder: null as number | null,
  maxUses: null as number | null, expiresAt: null as number | null,
  isActive: true,
};

export default function AdminPromosPage() {
  const promos = useQuery(api.promoCodes.list);
  const createPromo = useMutation(api.promoCodes.create);
  const updatePromo = useMutation(api.promoCodes.update);
  const deletePromo = useMutation(api.promoCodes.remove);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultPromo);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm(defaultPromo);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await updatePromo({ promoId: editingId as any, ...form, expiresAt: form.expiresAt, minOrder: form.minOrder });
      } else {
        await createPromo({ ...form, expiresAt: form.expiresAt, minOrder: form.minOrder });
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: any) => {
    setForm({
      code: p.code, discountType: p.discountType, discountValue: p.discountValue,
      minOrder: p.minOrder, maxUses: p.maxUses, expiresAt: p.expiresAt, isActive: p.isActive,
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this promo code?')) {
      await deletePromo({ promoId: id as any });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-cream-100">Promo Codes</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-gold-500 text-charcoal-900 font-semibold text-sm hover:bg-gold-400 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Promo
        </button>
      </div>

      {!promos ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : promos.length === 0 ? (
        <p className="text-sm text-charcoal-500">No promo codes yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-charcoal-800">
          <table className="w-full text-sm">
            <thead className="bg-charcoal-900 text-charcoal-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Min Order</th>
                <th className="px-4 py-3 font-medium">Uses</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {promos.map((p: any) => (
                <tr key={p._id} className="hover:bg-charcoal-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-cream-100">{p.code}</span>
                  </td>
                  <td className="px-4 py-3 text-charcoal-300">
                    {p.discountType === 'percentage' ? `${p.discountValue}%` : `EGP ${p.discountValue}`}
                  </td>
                  <td className="px-4 py-3 text-charcoal-400">
                    {p.minOrder ? `EGP ${p.minOrder}` : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-charcoal-300">
                    {p.currentUses}{p.maxUses ? ` / ${p.maxUses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-charcoal-400 text-xs">
                    {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      p.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(p)} className="p-1.5 rounded hover:bg-charcoal-800 text-charcoal-400 hover:text-gold-400 transition-colors cursor-pointer">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded hover:bg-charcoal-800 text-charcoal-400 hover:text-red-400 transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-charcoal-900 rounded-xl border border-charcoal-800 w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-lg font-bold text-cream-100 mb-5">
              {editingId ? 'Edit Promo Code' : 'New Promo Code'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-charcoal-400 mb-1 uppercase tracking-wider">Code</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full h-10 px-3 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 text-sm focus:outline-none focus:border-gold-500 font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-charcoal-400 mb-1 uppercase tracking-wider">Type</label>
                  <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 text-sm focus:outline-none focus:border-gold-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed (EGP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-charcoal-400 mb-1 uppercase tracking-wider">Value</label>
                  <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-charcoal-400 mb-1 uppercase tracking-wider">Min Order (EGP)</label>
                  <input type="number" value={form.minOrder ?? ''} onChange={(e) => setForm({ ...form, minOrder: e.target.value ? Number(e.target.value) : null })}
                    className="w-full h-10 px-3 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-charcoal-400 mb-1 uppercase tracking-wider">Max Uses</label>
                  <input type="number" value={form.maxUses ?? ''} onChange={(e) => setForm({ ...form, maxUses: e.target.value ? Number(e.target.value) : null })}
                    className="w-full h-10 px-3 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-charcoal-400 mb-1 uppercase tracking-wider">Expires At (timestamp)</label>
                <input type="date" value={form.expiresAt ? new Date(form.expiresAt).toISOString().split('T')[0] : ''}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value ? new Date(e.target.value).getTime() : null })}
                  className="w-full h-10 px-3 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 text-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-charcoal-300 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-charcoal-600 bg-charcoal-800 text-gold-500 focus:ring-gold-500/30"
                />
                Active
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-charcoal-800">
              <button onClick={resetForm} className="h-10 px-5 rounded-lg text-sm text-charcoal-300 hover:text-cream-100 transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.code}
                className="h-10 px-5 rounded-lg bg-gold-500 text-charcoal-900 font-semibold text-sm hover:bg-gold-400 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
