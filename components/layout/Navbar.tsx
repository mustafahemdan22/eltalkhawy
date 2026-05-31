'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  ShoppingCart,
  Heart,
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  Phone,
  Truck,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NAV_LINKS, CATEGORIES, SITE_CONFIG } from '@/lib/constants';
import CartDrawer from '@/components/layout/CartDrawer';

/* ── Types ── */
interface NavbarProps {
  cartCount?:    number;
  wishlistCount?:number;
}

/* ── Navbar ── */
export default function Navbar({ cartCount = 0, wishlistCount = 0 }: NavbarProps) {
  const pathname            = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const { user }  = useUser();
  const currentUser = useQuery(api.users.currentUser);
  const isAdmin = currentUser?.role === 'admin';
  const { locale } = useLocale();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [localCartCount, setLocalCartCount] = useState(0);

  // ── Convex Real-time Data ──
  const dbCart = useQuery(api.cart.get, user ? { userId: user.id } : 'skip');
  const dbWishlist = useQuery(api.wishlist.get, user ? { userId: user.id } : 'skip');

  // Guest Cart Tracker
  useEffect(() => {
    if (!user) {
      const updateCount = () => {
        const guestCart = JSON.parse(localStorage.getItem('et_guest_cart') ?? '[]');
        const totalQty = guestCart.reduce((acc: number, item: any) => acc + item.quantity, 0);
        setLocalCartCount(totalQty);
      };
      updateCount();
      window.addEventListener('storage', updateCount);
      return () => window.removeEventListener('storage', updateCount);
    }
  }, [user]);

  const displayCartCount = user
    ? (dbCart?.items ?? []).reduce((acc, item) => acc + item.quantity, 0)
    : localCartCount;

  const displayWishlistCount = user
    ? (dbWishlist ?? []).length
    : 0;

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* close mobile on route change */
  useEffect(() => {
    setMobileOpen(false);
    setShopOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  /* lock scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  /* focus search input */
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  /* open cart listener */
  useEffect(() => {
    const handleOpenCart = () => setCartDrawerOpen(true);
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, []);

  /* close mobile menu / search on Escape */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mobileOpen) setMobileOpen(false);
        if (searchOpen) setSearchOpen(false);
        if (shopOpen) setShopOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, searchOpen, shopOpen]);

  /* mounted for theme hydration */
  useEffect(() => { setMounted(true); }, []);

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    const path = pathname.startsWith(`/${locale}`)
      ? pathname.replace(`/${locale}`, `/${newLocale}`)
      : `/${newLocale}${pathname === '/' ? '' : pathname}`;
    router.push(path);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* ── Top bar ── */}
      <div className="hidden md:flex items-center justify-between bg-surface border-b border-muted px-6 py-2.5 text-sm text-secondary">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <Truck className="w-3 h-3 text-[var(--gold)]" aria-hidden="true" />
            {locale === 'ar' ? 'توصيل مجاني للطلبات فوق' : 'Free delivery over'}{' '}
            <strong className="text-primary">{locale === 'ar' ? '' : 'EGP '}{SITE_CONFIG.deliveryMin}{locale === 'ar' ? ' ج.م' : ''}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-[var(--gold)]" aria-hidden="true" />
            <a href={`tel:${SITE_CONFIG.phone}`} className="hover:text-primary transition-colors">
              {SITE_CONFIG.phone}
            </a>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href={`/${locale}/faq`}     className="hover:text-primary transition-colors">{locale === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}</Link>
          <Link href={`/${locale}/about`}   className="hover:text-primary transition-colors">{locale === 'ar' ? 'عن المتجر' : 'About'}</Link>
          <Link href={`/${locale}/contact`} className="hover:text-primary transition-colors">{locale === 'ar' ? 'تواصل معنا' : 'Contact'}</Link>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-350 ease-premium',
          scrolled
            ? 'bg-base/95 backdrop-blur-md border-b border-muted shadow-card'
            : 'bg-base border-b border-muted',
        )}
      >
        <nav
          className="container-brand flex items-center justify-between h-[72px]"
          aria-label="Main navigation"
        >
          {/* ── Logo ── */}
          <Link href={`/${locale}`} className="flex items-center gap-4 shrink-0 group" aria-label="El Talkhawy home">
            <div className="w-11 h-11 rounded-full bg-gradient-brand flex items-center justify-center shadow-gold group-hover:shadow-gold-lg transition-shadow duration-300">
              <span className="text-[var(--brand-fg)] font-display font-bold text-sm leading-none select-none">
                ET
              </span>
            </div>
            <div className="hidden sm:block">
              <div className="font-display font-bold text-primary text-lg leading-none tracking-tight">
                {locale === 'ar' ? SITE_CONFIG.nameAr : SITE_CONFIG.name}
              </div>
              <div className="text-[var(--gold)] text-2xs font-medium tracking-[0.15em] uppercase leading-none mt-0.5">
                {locale === 'ar' ? 'لحوم بلدية فاخرة' : 'Premium Meat'}
              </div>
            </div>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <ul className="hidden lg:flex items-center gap-1.5" role="list">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              const isShop = link.href === '/shop';
              const labelText = locale === 'ar' ? link.labelAr : link.label;

              if (isShop) {
                return (
                  <li key={link.href} className="relative">
                    <button
                      onClick={() => setShopOpen((v) => !v)}
                      className={cn(
                        'flex items-center gap-1 px-3.5 py-2.5 rounded-button text-sm font-medium transition-all duration-250',
                        active || shopOpen
                          ? 'text-primary bg-surface-raised'
                          : 'text-secondary hover:text-primary hover:bg-surface',
                      )}
                      aria-expanded={shopOpen}
                      aria-haspopup="true"
                    >
                      {labelText}
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 transition-transform duration-250',
                          shopOpen && 'rotate-180',
                        )}
                        aria-hidden="true"
                      />
                    </button>

                    {/* Mega menu */}
                    <AnimatePresence>
                      {shopOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[680px] glass rounded-card shadow-raised p-6"
                          role="menu"
                        >
                          <div className="grid grid-cols-3 gap-5">
                            {CATEGORIES.map((cat: any) => (
                              <Link
                                key={cat.slug}
                                href={`/${locale}/categories/${cat.slug}`}
                                role="menuitem"
                                className="flex items-center gap-3 p-4 rounded-lg hover:bg-surface-raised transition-colors group/item"
                                onClick={() => setShopOpen(false)}
                              >
                                <span className="text-xl leading-none" aria-hidden="true">
                                  {cat.icon}
                                </span>
                                <span className="text-sm text-secondary group-hover/item:text-primary transition-colors font-medium">
                                  {locale === 'ar' ? cat.nameAr : cat.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t border-muted">
                            <Link
                              href={`/${locale}/shop`}
                              className="flex items-center justify-center gap-2 text-sm text-[var(--gold)] hover:text-[var(--gold-hover)] font-medium transition-colors"
                              onClick={() => setShopOpen(false)}
                            >
                              {locale === 'ar' ? 'عرض جميع المنتجات ←' : 'View all products →'}
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              }

              return (
                <li key={link.href}>
                  <Link
                    href={link.href === '/' ? `/${locale}` : `/${locale}${link.href}`}
                    className={cn(
                      'block px-3.5 py-2.5 rounded-button text-sm font-medium transition-all duration-250',
                      active
                        ? 'text-primary bg-surface-raised'
                        : 'text-secondary hover:text-primary hover:bg-surface',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {labelText}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search button */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="p-2.5 rounded-button text-secondary hover:text-primary hover:bg-surface transition-all duration-250"
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="hidden sm:flex items-center gap-1.5 p-2.5 rounded-button text-secondary hover:text-primary hover:bg-surface transition-all duration-250"
              aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            >
              <Globe className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs font-semibold tracking-wide">{locale === 'en' ? 'EN' : 'AR'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex p-2.5 rounded-button text-secondary hover:text-primary hover:bg-surface transition-all duration-250"
              aria-label={mounted && theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Moon className="w-5 h-5" aria-hidden="true" />
              )}
            </button>

            {/* Wishlist */}
            <Link
              href={`/${locale}/wishlist`}
              className="relative p-2.5 rounded-button text-secondary hover:text-primary hover:bg-surface transition-all duration-250"
              aria-label={`Wishlist${displayWishlistCount > 0 ? `, ${displayWishlistCount} items` : ''}`}
            >
              <Heart className="w-5 h-5" aria-hidden="true" />
              {displayWishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--brand)] text-[var(--brand-fg)] text-2xs font-bold rounded-full flex items-center justify-center leading-none">
                  {displayWishlistCount > 9 ? '9+' : displayWishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2 rounded-button text-secondary hover:text-primary hover:bg-surface transition-all duration-250 cursor-pointer"
              aria-label={`Cart${displayCartCount > 0 ? `, ${displayCartCount} items` : ''}`}
            >
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              {displayCartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--gold)] text-[var(--gold-fg)] text-2xs font-bold rounded-full flex items-center justify-center leading-none">
                  {displayCartCount > 9 ? '9+' : displayCartCount}
                </span>
              )}
            </button>

            {/* Auth */}
            <div className="hidden sm:flex items-center gap-2 ml-1">
              <SignedIn>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-button text-xs uppercase tracking-wider text-[var(--gold)] hover:text-[var(--gold-hover)] hover:bg-[var(--gold-subtle)] transition-all duration-250"
                  >
                    {locale === 'ar' ? 'التحكم' : 'Admin'}
                  </Link>
                )}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9 ring-1 ring-[var(--gold)]/40 hover:ring-[var(--gold)] transition-all',
                    },
                  }}
                />
              </SignedIn>
              <SignedOut>
                <Link
                  href={`/${locale}/sign-in`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-button text-sm text-secondary hover:text-primary hover:bg-surface transition-all duration-250"
                  aria-label={locale === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden md:inline">{locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                </Link>
              </SignedOut>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 ml-1 rounded-button text-secondary hover:text-primary hover:bg-surface transition-all"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>

        {/* ── Search Bar ── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-muted overflow-hidden"
            >
              <div className="container-brand py-4">
                <div className="relative max-w-xl mx-auto">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    ref={searchRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={locale === 'ar' ? 'ابحث عن لحم بقري، ضأن، عجل...' : 'Search for beef, lamb, veal…'}
                    className={cn(
                      'w-full pl-11 pr-4 py-3 rounded-button text-sm',
                      'bg-surface-raised/80 border border-muted',
                      'text-primary placeholder:text-muted',
                      'focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/30',
                      'transition-all duration-250',
                    )}
                    aria-label={locale === 'ar' ? 'البحث عن المنتجات' : 'Search products'}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setSearchOpen(false);
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        window.location.href = `/${locale}/shop?q=${encodeURIComponent(searchQuery.trim())}`;
                      }
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Mobile Menu Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-[var(--bg-overlay)] lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              id="mobile-menu"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-80 bg-base border-r border-muted flex flex-col lg:hidden overflow-y-auto"
              role="dialog"
              aria-label="Mobile navigation"
              aria-modal="true"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-muted">
                <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                  <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center">
                    <span className="text-[var(--brand-fg)] font-display font-bold text-xs">ET</span>
                  </div>
                  <span className="font-display font-bold text-primary">El Talkhawy</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-button text-secondary hover:text-primary hover:bg-surface"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 p-6 space-y-1.5">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href === '/' ? `/${locale}` : `/${locale}${link.href}`}
                    className={cn(
                      'flex items-center gap-4 px-5 py-4 rounded-lg text-sm font-medium transition-colors',
                      isActive(link.href)
                        ? 'bg-surface-raised text-primary'
                        : 'text-secondary hover:bg-surface hover:text-primary',
                    )}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                  >
                    {locale === 'ar' ? link.labelAr : link.label}
                  </Link>
                ))}

                {/* Categories shortcut */}
                <div className="pt-4 border-t border-muted">
                  <p className="section-label text-[var(--gold)] px-5 pb-3">
                    {locale === 'ar' ? 'التصنيفات' : 'Categories'}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {CATEGORIES.slice(0, 8).map((cat: any) => (
                      <Link
                        key={cat.slug}
                        href={`/${locale}/categories/${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-secondary hover:bg-surface hover:text-primary transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        <span aria-hidden="true">{cat.icon}</span>
                        {locale === 'ar' ? cat.nameAr : cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>

              {/* Footer */}
              <div className="p-6 border-t border-muted space-y-3">
                {/* Mobile Toggles */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-muted">
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-3 py-2 rounded-button text-secondary hover:text-primary hover:bg-surface-raised transition-colors text-sm"
                    aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
                  >
                    <Globe className="w-4 h-4" aria-hidden="true" />
                    {locale === 'en' ? 'English' : 'العربية'}
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-button text-secondary hover:text-primary hover:bg-surface-raised transition-colors"
                    aria-label={mounted && theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {mounted && theme === 'dark' ? (
                      <Sun className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Moon className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                <SignedIn>
                  <Link
                    href="/account"
                    className="flex items-center gap-4 px-5 py-3.5 rounded-lg text-sm text-secondary hover:bg-surface-raised hover:text-primary transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="w-4 h-4" aria-hidden="true" />
                    {locale === 'ar' ? 'حسابي' : 'My Account'}
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-4 px-5 py-3.5 rounded-lg text-sm text-[var(--gold)] hover:bg-[var(--gold-subtle)] transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {locale === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}
                    </Link>
                  )}
                </SignedIn>
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-button text-sm font-medium bg-[var(--brand)] text-[var(--brand-fg)] hover:bg-[var(--brand-hover)] transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="w-4 h-4" aria-hidden="true" />
                    {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                  </Link>
                </SignedOut>
                <a
                  href={`tel:${SITE_CONFIG.phone}`}
                  className="flex items-center gap-2 px-4 py-1 text-xs text-secondary hover:text-primary"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  {SITE_CONFIG.phone}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Click outside mega menu */}
      {shopOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShopOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-in cart drawer */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </>
  );
}
