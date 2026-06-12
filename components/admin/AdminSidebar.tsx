'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Image as ImageIcon,
  Tags,
  Settings,
  Store,
  LogOut,
  X,
  Users,
  Ticket,
} from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils';

type NavItem = {
  href:  string;
  label: string;
  icon:  React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  match?: (path: string) => boolean;
};

export const ADMIN_DRAWER_EVENT = 'admin:open-drawer';

export default function AdminSidebar() {
  const { locale, dict } = useLocale();
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(ADMIN_DRAWER_EVENT, onOpen);
    return () => window.removeEventListener(ADMIN_DRAWER_EVENT, onOpen);
  }, []);

  useEffect(() => {
    const onPop = () => setOpen(false);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const base = `/${locale}/admin`;

  const items: NavItem[] = [
    { href: base, label: dict.admin.nav.dashboard, icon: LayoutDashboard, match: (p) => p === base },
    { href: `${base}/products`, label: dict.admin.nav.products, icon: Package, match: (p) => p.startsWith(`${base}/products`) },
    { href: `${base}/orders`, label: dict.admin.nav.orders, icon: ShoppingBag, match: (p) => p.startsWith(`${base}/orders`) },
    { href: `${base}/media`, label: dict.admin.nav.media, icon: ImageIcon, match: (p) => p.startsWith(`${base}/media`) },
    { href: `${base}/categories`, label: dict.admin.nav.categories, icon: Tags, match: (p) => p.startsWith(`${base}/categories`) },
    ...(dict.admin.nav.customers
      ? [{ href: `${base}/customers`, label: dict.admin.nav.customers, icon: Users, match: (p: string) => p.startsWith(`${base}/customers`) } as NavItem]
      : []),
    ...(dict.admin.nav.promoCodes
      ? [{ href: `${base}/promo-codes`, label: dict.admin.nav.promoCodes, icon: Ticket, match: (p: string) => p.startsWith(`${base}/promo-codes`) } as NavItem]
      : []),
    { href: `${base}/settings`, label: dict.admin.nav.settings, icon: Settings, match: (p) => p.startsWith(`${base}/settings`) },
  ];

  const isActive = (item: NavItem) =>
    item.match ? item.match(pathname) : pathname.startsWith(item.href);

  const NavContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border-subtle)]">
        <div className="flex h-9 w-9 items-center justify-center rounded-button bg-gradient-brand text-[var(--brand-fg)] font-display font-bold">
          E
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm font-bold text-[var(--text-primary)] truncate">
            {dict.admin.brand}
          </p>
          <p className="text-2xs text-[var(--text-secondary)] truncate">{dict.admin.tagline}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="ml-auto lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-button text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)]"
          aria-label={dict.admin.common.closeMenu}
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group flex items-center gap-3 rounded-button min-h-11 px-3 text-sm font-semibold',
                    'transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]',
                    active
                      ? 'bg-[var(--gold-subtle)]/40 text-[var(--gold)] shadow-[inset_3px_0_0_0_var(--gold)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      active ? 'text-[var(--gold)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]',
                    )}
                    aria-hidden
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[var(--border-subtle)] p-3 flex flex-col gap-1">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-button bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)]">
            {user.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.imageUrl}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-brand text-[var(--brand-fg)] flex items-center justify-center text-xs font-bold">
                {user.firstName?.[0] ?? 'A'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                {user.fullName || user.firstName || 'Admin'}
              </p>
              <p className="text-2xs text-[var(--text-secondary)] truncate">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        )}
        <Link
          href={`/${locale}`}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-button min-h-10 px-3 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)]"
        >
          <Store className="h-4 w-4" aria-hidden />
          <span>{dict.admin.nav.backToStore}</span>
        </Link>
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: `/${locale}` })}
          className="flex items-center gap-3 rounded-button min-h-10 px-3 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--error)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)] w-full"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          <span>{dict.admin.nav.signOut}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'hidden lg:flex sticky top-0 h-screen w-64 shrink-0',
          'border-r border-[var(--border-subtle)] bg-[var(--bg-surface)]',
        )}
        aria-label="Admin sidebar"
      >
        {NavContent}
      </aside>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[var(--bg-overlay)]/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label={dict.admin.common.closeMenu}
            tabIndex={-1}
          />
          <div className="relative ml-0 flex h-full w-72 max-w-[85vw] flex-col bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] shadow-raised">
            {NavContent}
          </div>
        </div>
      )}
    </>
  );
}
