import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      /* ── Semantic surface/background tokens ── */
      colors: {
        base:           'var(--bg-base)',
        surface:        'var(--bg-surface)',
        'surface-raised': 'var(--bg-surface-raised)',
        'surface-hover':  'var(--bg-surface-hover)',
        overlay:        'var(--bg-overlay)',
        inset:          'var(--bg-inset)',

        primary:        'var(--text-primary)',
        secondary:      'var(--text-secondary)',
        muted:          'var(--text-muted)',
        disabled:       'var(--text-disabled)',
        inverse:        'var(--text-inverse)',
        placeholder:    'var(--text-placeholder)',

        'border-muted':  'var(--border-muted)',
        'border-default':'var(--border-default)',
        'border-subtle': 'var(--border-subtle)',
        'border-hover':  'var(--border-hover)',

        /* ── Brand palette (static hex, always available) ── */
        burgundy: {
          950: '#100006',
          900: '#1e000d',
          800: '#380018',
          700: '#540022',
          600: '#70002e',
          500: '#8c003a',
          400: '#c03060',
          300: '#d96080',
          200: '#f0a0b5',
          100: '#fce8ee',
        },
        charcoal: {
          950: '#0a0908',
          900: '#0f0e0c',
          800: '#1a1815',
          700: '#252220',
          600: '#2d2926',
          500: '#3a3530',
          400: '#4a4540',
          300: '#6b6356',
          200: '#8a8073',
          100: '#bcb4a8',
          50:  '#f0ebe3',
        },
        gold: {
          700: '#6b4d14',
          600: '#8a6b1c',
          500: '#a07820',
          400: '#c49828',
          300: '#d4aa40',
          200: '#e0c060',
          100: '#ebd490',
          50:  '#f7eec8',
        },
        cream: {
          50:  '#faf6ef',
          100: '#f4eee4',
          200: '#ece3d6',
          300: '#e4d9c8',
          400: '#d4c4a8',
          500: '#c8b89a',
        },
        ivory: {
          50:  '#fdfaf5',
          100: '#f8f3ea',
          200: '#f0e8d8',
          300: '#e5d9c2',
          400: '#d4c4a5',
          500: '#baa882',
        },
        taupe: {
          900: '#1c1712',
          800: '#2e2820',
          700: '#3d3428',
          600: '#504438',
          500: '#6b5c48',
          400: '#8a7a68',
        },

        /* ── Functional / eCommerce colors ── */
        fresh: {
          DEFAULT: 'var(--fresh)',
          bg:      'var(--fresh-bg)',
          border:  'var(--fresh-border)',
        },
        frozen: {
          DEFAULT: 'var(--frozen)',
          bg:      'var(--frozen-bg)',
          border:  'var(--frozen-border)',
        },
        error: {
          DEFAULT: 'var(--error)',
          bg:      'var(--error-bg)',
          border:  'var(--error-border)',
        },
        success: {
          DEFAULT: 'var(--success)',
          bg:      'var(--success-bg)',
          border:  'var(--success-border)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          bg:      'var(--warning-bg)',
          border:  'var(--warning-border)',
        },
        info: {
          DEFAULT: 'var(--info)',
          bg:      'var(--info-bg)',
          border:  'var(--info-border)',
        },

        /* ── eCommerce: Price ── */
        'price-current':   'var(--price-current)',
        'price-original':  'var(--price-original)',
        'price-sale':      'var(--price-sale)',
        'price-unit':      'var(--price-unit)',

        /* ── eCommerce: Stock ── */
        'stock-in':        'var(--stock-in)',
        'stock-in-bg':      'var(--stock-in-bg)',
        'stock-low':       'var(--stock-low)',
        'stock-low-bg':     'var(--stock-low-bg)',
        'stock-out':       'var(--stock-out)',
        'stock-out-bg':    'var(--stock-out-bg)',

        /* ── eCommerce: Badges ── */
        'badge-discount':       'var(--badge-discount-bg)',
        'badge-discount-fg':    'var(--badge-discount-fg)',
        'badge-bestseller':     'var(--badge-bestseller-bg)',
        'badge-bestseller-fg':  'var(--badge-bestseller-fg)',
        'badge-premium':        'var(--badge-premium-fg)',

        /* ── eCommerce: UI ── */
        'rating-star':       'var(--rating-star)',
        'rating-star-empty': 'var(--rating-star-empty)',
        'delivery-icon':     'var(--delivery-icon)',
        'trust-icon':        'var(--trust-icon)',
        'trust-bg':          'var(--trust-bg)',
        'wishlist-active':   'var(--wishlist-active)',
        'wishlist-active-bg':'var(--wishlist-active-bg)',

        nav: {
          DEFAULT: 'var(--nav-bg)',
          border:  'var(--nav-border)',
        },
        footer: {
          DEFAULT: 'var(--footer-bg)',
          border:  'var(--footer-border)',
        },
      },

      /* ── Fonts ── */
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
        arabic:  ['var(--font-arabic)', 'Cairo', 'Tajawal', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      /* ── Shadows ── */
      boxShadow: {
        'sm':         'var(--shadow-sm)',
        'card':       'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'raised':     'var(--shadow-raised)',
        'xl':         'var(--shadow-xl)',
        'gold':       'var(--shadow-gold)',
        'gold-sm':    '0 0 10px rgba(201, 162, 39, 0.12)',
        'gold-lg':    'var(--shadow-gold-lg)',
        'inset-gold': 'var(--shadow-inset-gold)',
      },

      /* ── Radii ── */
      borderRadius: {
        card:   'var(--radius-card)',
        badge:  'var(--radius-sm)',
        button: 'var(--radius-md)',
      },

      /* ── Gradients ── */
      backgroundImage: {
        'gradient-brand':    'linear-gradient(135deg, var(--brand) 0%, var(--brand-active) 100%)',
        'gradient-brand-r':  'linear-gradient(135deg, var(--brand-hover) 0%, var(--brand) 100%)',
        'gradient-gold':     'linear-gradient(135deg, var(--gold) 0%, var(--gold-muted) 100%)',
        'gradient-dark':     'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
        'gradient-surface':  'linear-gradient(180deg, var(--bg-surface-raised) 0%, var(--bg-surface) 100%)',
        'gradient-hero':     'linear-gradient(180deg, rgba(10,9,8,0) 40%, rgba(10,9,8,0.92) 100%)',
        'gradient-hero-r':   'linear-gradient(90deg, rgba(10,9,8,0.9) 0%, rgba(10,9,8,0) 60%)',
        'gradient-card':     'linear-gradient(180deg, rgba(10,9,8,0) 50%, rgba(10,9,8,0.88) 100%)',
        'gradient-light-hero':'linear-gradient(180deg, rgba(250,246,239,0) 40%, rgba(250,246,239,0.95) 100%)',
      },

      /* ── Keyframes ── */
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulse_gold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(196,152,40,0)' },
          '50%':       { boxShadow: '0 0 0 6px rgba(196,152,40,0.2)' },
        },
      },

      /* ── Animations ── */
      animation: {
        shimmer:       'shimmer 2s infinite linear',
        fadeIn:        'fadeIn 0.4s ease-out',
        slideUp:       'slideUp 0.5s ease-out',
        slideInRight:  'slideInRight 0.35s cubic-bezier(0.32,0.72,0,1)',
        pulse_gold:    'pulse_gold 2s ease-in-out infinite',
      },

      /* ── Timing functions ── */
      transitionTimingFunction: {
        premium: 'var(--ease-premium)',
      },

      /* ── Durations ── */
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },

      /* ── Spacing extensions ── */
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },

      /* ── Z-index ── */
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      /* ── Max widths ── */
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },

      /* ── Aspect ratios ── */
      aspectRatio: {
        'product':  '3 / 4',
        'banner':   '16 / 5',
        'category': '4 / 3',
      },
    },
  },
  plugins: [],
};

export default config;
