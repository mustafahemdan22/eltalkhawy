'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { formatPrice, cn } from '@/lib/utils';
import { Plus, Edit3, Trash2, Search } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

const defaultProduct = {
  slug: '', name: '', nameAr: '', description: '', descriptionAr: '',
  categorySlug: 'beef', subcategory: '', images: [] as string[],
  basePrice: 0, variants: [] as { weight: string; price: number; stock: number }[],
  isFresh: true, isFrozen: false, isAvailable: true,
  isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
  tags: [] as string[], unit: 'kg', cookingTips: [] as string[],
  discount: null as number | null,
};

type ProductForm = typeof defaultProduct;

export default function AdminProductsPage() {
  const products = useQuery(api.products.listAll);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(defaultProduct);
  const [saving, setSaving] = useState(false);

  const filtered = products
    ? products.filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const resetForm = () => {
    setForm(defaultProduct);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        subcategory: form.subcategory || undefined,
        discount: form.discount ?? undefined,
        tags: form.tags.filter(Boolean),
        cookingTips: form.cookingTips.filter(Boolean),
        images: form.images.filter(Boolean),
      };
      if (editingId) {
        await updateProduct({ productId: editingId as any, ...payload });
      } else {
        await createProduct(payload as any);
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: any) => {
    setForm({
      slug: p.slug, name: p.name, nameAr: p.nameAr,
      description: p.description, descriptionAr: p.descriptionAr,
      categorySlug: p.categorySlug, subcategory: p.subcategory || '',
      images: p.images, basePrice: p.basePrice,
      variants: p.variants,
      isFresh: p.isFresh, isFrozen: p.isFrozen, isAvailable: p.isAvailable,
      isBestSeller: p.isBestSeller, isPremiumCut: p.isPremiumCut,
      isFeatured: p.isFeatured, isBBQ: p.isBBQ,
      tags: p.tags, unit: p.unit, cookingTips: p.cookingTips,
      discount: p.discount,
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this product?')) {
      await deleteProduct({ productId: id as any });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-cream-100">Products</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-gold-500 text-charcoal-900 font-semibold text-sm hover:bg-gold-400 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Product
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 h-10 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 placeholder:text-charcoal-500 text-sm focus:outline-none focus:border-gold-500"
        />
      </div>

      {!products ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-charcoal-500">No products found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-charcoal-800">
          <table className="w-full text-sm">
            <thead className="bg-charcoal-900 text-charcoal-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Base Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {filtered.map((p: any) => {
                const totalStock = p.variants.reduce((s: number, v: any) => s + v.stock, 0);
                return (
                  <tr key={p._id} className="hover:bg-charcoal-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-cream-100 font-medium">{p.name}</p>
                      <p className="text-charcoal-500 text-xs">{p.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-charcoal-300">{p.categorySlug}</td>
                    <td className="px-4 py-3 font-mono text-cream-100">EGP {formatPrice(p.basePrice)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'font-mono text-sm',
                        totalStock < 10 ? 'text-orange-400' : 'text-charcoal-300',
                      )}>
                        {totalStock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-xs px-2 py-1 rounded font-medium',
                        p.isAvailable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400',
                      )}>
                        {p.isAvailable ? 'Active' : 'Hidden'}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-charcoal-900 rounded-xl border border-charcoal-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-lg font-bold text-cream-100 mb-5">
              {editingId ? 'Edit Product' : 'New Product'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Name (EN)" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Input label="Name (AR)" value={form.nameAr} onChange={(v) => setForm({ ...form, nameAr: v })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
                <select
                  value={form.categorySlug}
                  onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                  className="h-10 px-3 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 text-sm focus:outline-none focus:border-gold-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Subcategory" value={form.subcategory} onChange={(v) => setForm({ ...form, subcategory: v })} />
                <Input label="Unit" value={form.unit} onChange={(v) => setForm({ ...form, unit: v })} />
              </div>
              <div>
                <label className="block text-xs text-charcoal-400 mb-1 uppercase tracking-wider">Description (EN)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 text-sm focus:outline-none focus:border-gold-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-charcoal-400 mb-1 uppercase tracking-wider">Description (AR)</label>
                <textarea
                  value={form.descriptionAr}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 text-sm focus:outline-none focus:border-gold-500 resize-none"
                />
              </div>
              <Input label="Base Price (EGP)" type="number" value={String(form.basePrice)} onChange={(v) => setForm({ ...form, basePrice: Number(v) })} />
              <Input label="Discount (%)" type="number" value={String(form.discount ?? '')} onChange={(v) => setForm({ ...form, discount: v ? Number(v) : null })} />
              <Input label="Images (comma-separated URLs)" value={form.images.join(', ')} onChange={(v) => setForm({ ...form, images: v.split(',').map((s: string) => s.trim()).filter(Boolean) })} />
              <Input label="Tags (comma-separated)" value={form.tags.join(', ')} onChange={(v) => setForm({ ...form, tags: v.split(',').map((s: string) => s.trim()).filter(Boolean) })} />
              <Input label="Cooking Tips (one per line)" value={form.cookingTips.join('\n')} onChange={(v) => setForm({ ...form, cookingTips: v.split('\n').filter(Boolean) })} textarea />

              <div>
                <label className="block text-xs text-charcoal-400 mb-2 uppercase tracking-wider">Variants (weight / price / stock)</label>
                {form.variants.map((v, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={v.weight} onChange={(e) => {
                      const vv = [...form.variants];
                      vv[i] = { ...vv[i], weight: e.target.value };
                      setForm({ ...form, variants: vv });
                    }} placeholder="500g" className="flex-1 h-9 px-3 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 text-sm focus:outline-none focus:border-gold-500" />
                    <input value={v.price} onChange={(e) => {
                      const vv = [...form.variants];
                      vv[i] = { ...vv[i], price: Number(e.target.value) };
                      setForm({ ...form, variants: vv });
                    }} type="number" placeholder="Price" className="w-24 h-9 px-3 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 text-sm focus:outline-none focus:border-gold-500" />
                    <input value={v.stock} onChange={(e) => {
                      const vv = [...form.variants];
                      vv[i] = { ...vv[i], stock: Number(e.target.value) };
                      setForm({ ...form, variants: vv });
                    }} type="number" placeholder="Stock" className="w-20 h-9 px-3 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 text-sm focus:outline-none focus:border-gold-500" />
                    <button onClick={() => setForm({ ...form, variants: form.variants.filter((_, j) => j !== i) })} className="p-2 text-charcoal-400 hover:text-red-400 cursor-pointer">×</button>
                  </div>
                ))}
                <button
                  onClick={() => setForm({ ...form, variants: [...form.variants, { weight: '', price: 0, stock: 0 }] })}
                  className="text-xs text-gold-400 hover:text-gold-300 cursor-pointer"
                >
                  + Add Variant
                </button>
              </div>

              <div className="flex flex-wrap gap-4">
                <Toggle label="Fresh" checked={form.isFresh} onChange={(v) => setForm({ ...form, isFresh: v })} />
                <Toggle label="Frozen" checked={form.isFrozen} onChange={(v) => setForm({ ...form, isFrozen: v })} />
                <Toggle label="Available" checked={form.isAvailable} onChange={(v) => setForm({ ...form, isAvailable: v })} />
                <Toggle label="Best Seller" checked={form.isBestSeller} onChange={(v) => setForm({ ...form, isBestSeller: v })} />
                <Toggle label="Premium Cut" checked={form.isPremiumCut} onChange={(v) => setForm({ ...form, isPremiumCut: v })} />
                <Toggle label="Featured" checked={form.isFeatured} onChange={(v) => setForm({ ...form, isFeatured: v })} />
                <Toggle label="BBQ / Grill" checked={form.isBBQ} onChange={(v) => setForm({ ...form, isBBQ: v })} />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-charcoal-800">
              <button onClick={resetForm} className="h-10 px-5 rounded-lg text-sm text-charcoal-300 hover:text-cream-100 transition-colors cursor-pointer">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.slug}
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

function Input({ label, value, onChange, type = 'text', textarea }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-charcoal-400 mb-1 uppercase tracking-wider">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
          className="w-full p-3 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 text-sm focus:outline-none focus:border-gold-500 resize-none"
        />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 px-3 rounded-lg bg-charcoal-800 border border-charcoal-700 text-cream-100 text-sm focus:outline-none focus:border-gold-500"
        />
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-charcoal-300 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-charcoal-600 bg-charcoal-800 text-gold-500 focus:ring-gold-500/30"
      />
      {label}
    </label>
  );
}
