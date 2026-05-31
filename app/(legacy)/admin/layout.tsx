'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  LayoutDashboard, Package, ShoppingCart, Percent, Users, ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const SIDEBAR_LINKS = [
  { href: '/admin',           label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/products',  label: 'Products',   icon: Package },
  { href: '/admin/orders',    label: 'Orders',     icon: ShoppingCart },
  { href: '/admin/promos',    label: 'Promo Codes',icon: Percent },
  { href: '/admin/users',     label: 'Users',      icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const currentUser = useQuery(api.users.currentUser);
  const hasAnyAdmin = useQuery(api.users.hasAnyAdmin);

  useEffect(() => {
    if (isLoaded && currentUser !== undefined && hasAnyAdmin !== undefined) {
      if (!user) router.push('/sign-in');
      else if (currentUser && currentUser.role !== 'admin') {
        router.push(hasAnyAdmin ? '/' : '/admin-setup');
      }
    }
  }, [isLoaded, user, currentUser, hasAnyAdmin, router]);

  if (!isLoaded || currentUser === undefined || hasAnyAdmin === undefined) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-950 flex">
      <aside className="w-60 bg-charcoal-900 border-r border-charcoal-800 flex flex-col shrink-0">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-charcoal-800">
          <Link href="/" className="font-display text-lg font-bold text-gold-400 tracking-tight">
            El Talkhawy
          </Link>
          <span className="text-2xs uppercase tracking-widest text-charcoal-500 bg-charcoal-800 px-2 py-0.5 rounded">
            Admin
          </span>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3">
          {SIDEBAR_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                    : 'text-charcoal-300 hover:text-cream-100 hover:bg-charcoal-800',
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-charcoal-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-charcoal-400 hover:text-cream-100 hover:bg-charcoal-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Site
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
