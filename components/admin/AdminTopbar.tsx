'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocale } from '@/components/LocaleProvider';
import { useDebounce } from '@/hooks/useDebounce';
import { cn, discountedPrice } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Package, ShoppingBag, Loader2, X, Menu, Globe } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import { ADMIN_DRAWER_EVENT } from './AdminSidebar';

export default function AdminTopbar() {
  const { locale, dict } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 200);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useQuery(
    api.products.globalSearch,
    debounced.length >= 2 ? { query: debounced, limit: 5 } : 'skip',
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const hasResults = results && (results.products.length > 0 || results.orders.length > 0);
  const showDropdown = open && debounced.length >= 2;
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

  const formatEGP = (n: number) =>
    locale === 'ar' ? `${n.toLocaleString('ar-EG')} ج.م` : `EGP ${n.toLocaleString()}`;

  return (
    <div
      ref={containerRef}
      className="sticky top-0 z-20 flex h-14 lg:h-16 items-center gap-2 sm:gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-sm px-3 sm:px-6 lg:px-8"
    >
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(ADMIN_DRAWER_EVENT))}
        className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-button text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
        aria-label={dict.admin.common.openMenu}
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      <div className="lg:hidden font-display text-sm font-bold text-[var(--text-primary)] shrink-0">
        {dict.admin.brand}
      </div>

      <div className="flex-1 max-w-2xl relative">
        <div
          className={cn(
            'flex items-center gap-2 h-10 sm:h-11 rounded-button border bg-[var(--bg-surface-raised)]/40 px-3 transition-colors',
            open ? 'border-[var(--gold-border)] ring-2 ring-[var(--gold)]/30' : 'border-[var(--border-subtle)]',
          )}
        >
          <Search className="h-4 w-4 text-[var(--text-secondary)] shrink-0" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={dict.admin.common.search}
            className="flex-1 min-w-0 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none"
            aria-label={dict.admin.common.search}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={showDropdown}
            aria-controls="admin-search-results"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="h-7 w-7 inline-flex items-center justify-center rounded-button text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] px-1.5 py-0.5 text-2xs font-mono text-[var(--text-secondary)]">
            {isMac ? '⌘' : 'Ctrl'} K
          </kbd>
        </div>

        {showDropdown && (
          <div
            id="admin-search-results"
            className="absolute top-full inset-x-0 mt-2 max-h-[70vh] overflow-y-auto rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-raised z-30"
            role="listbox"
          >
            {results === undefined ? (
              <div className="p-6 flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)]">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {dict.admin.common.loading}
              </div>
            ) : !hasResults ? (
              <div className="p-6 text-center text-sm text-[var(--text-secondary)]">
                {dict.admin.common.noResults}
              </div>
            ) : (
              <div className="py-2">
                {results.products.length > 0 && (
                  <section>
                    <p className="px-4 pt-2 pb-1 text-2xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      {dict.admin.nav.products}
                    </p>
                    <ul>
                      {results.products.map((p) => (
                        <li key={p._id}>
                          <Link
                            href={`/${locale}/admin/products/${p._id}`}
                            onClick={() => { setOpen(false); setQuery(''); }}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-surface-hover)] focus-visible:bg-[var(--bg-surface-hover)] focus-visible:outline-none"
                            role="option"
                          >
                            {p.images[0] ? (
                              <div className="relative h-9 w-9 rounded-button overflow-hidden bg-[var(--bg-surface-raised)] shrink-0">
                                <Image
                                  src={p.images[0]}
                                  alt=""
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="h-9 w-9 rounded-button bg-[var(--bg-surface-raised)] shrink-0 flex items-center justify-center">
                                <Package className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                {locale === 'ar' ? p.nameAr : p.name}
                              </p>
                              <p className="text-2xs text-[var(--text-secondary)] font-mono truncate">
                                {formatEGP(discountedPrice(p.basePrice, 0))}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {results.orders.length > 0 && (
                  <section>
                    <p className="px-4 pt-3 pb-1 text-2xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      {dict.admin.nav.orders}
                    </p>
                    <ul>
                      {results.orders.map((o) => (
                        <li key={o._id}>
                          <Link
                            href={`/${locale}/admin/orders/${o._id}`}
                            onClick={() => { setOpen(false); setQuery(''); }}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-surface-hover)] focus-visible:bg-[var(--bg-surface-hover)] focus-visible:outline-none"
                            role="option"
                          >
                            <div className="h-9 w-9 rounded-button bg-[var(--bg-surface-raised)] shrink-0 flex items-center justify-center">
                              <ShoppingBag className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                {o.orderNumber} · <span className="text-[var(--text-secondary)] font-normal">{o.customerName}</span>
                              </p>
                              <p className="text-2xs text-[var(--text-secondary)] font-mono truncate">
                                {formatEGP(o.total)}
                              </p>
                            </div>
                            <OrderStatusBadge status={o.status} size="sm" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ms-auto flex items-center gap-2">
        <button
          onClick={() => {
            const newLocale = locale === 'en' ? 'ar' : 'en';
            const path = pathname.startsWith(`/${locale}`)
              ? pathname.replace(`/${locale}`, `/${newLocale}`)
              : `/${newLocale}${pathname === '/' ? '' : pathname}`;
            router.push(path);
          }}
          className="flex items-center gap-1.5 p-2 px-3 rounded-button text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] transition-all duration-250 shrink-0"
          aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
        >
          <Globe className="w-4 h-4" aria-hidden="true" />
          <span className="text-xs font-semibold tracking-wide font-sans">{locale === 'en' ? 'AR' : 'EN'}</span>
        </button>
      </div>
    </div>
  );
}
