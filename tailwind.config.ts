import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{astro,js,ts,jsx,tsx,css}', './components/**/*.{astro,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Libertinus Serif"', 'serif'],
        serif: ['Fraunces', 'serif'],
        body: ['"Libertinus Serif"', 'serif'],
        heading: ['Fraunces', 'serif'],
        display: ['Fraunces', 'serif'],
        code: ['Fira Mono', 'monospace'],
      },
      fontSize: {
        hero: ['clamp(3.5rem, 6vw, 4.5rem)', { lineHeight: '1.2', fontWeight: '600' }],
        section: ['clamp(2.5rem, 4vw, 3rem)', { lineHeight: '1.2', fontWeight: '500' }],
        story: ['clamp(1.75rem, 3vw, 2.25rem)', { lineHeight: '1.3', fontWeight: '500' }],
        body: ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        nav: ['0.875rem', { lineHeight: '1.5', fontWeight: '500' }],
        caption: ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        meta: ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }],
        code: ['0.875rem', { lineHeight: '1.4' }],
      },
      colors: {
        cream: '#FCF5EE',
        'soft-nurture': '#F2D1D1',
        'rose-clay': '#DDB8B2',
        'dusty-blue': '#6F8695',
        charcoal: '#2D2A28',
        background: {
          DEFAULT: '#FCF5EE',
          muted: '#F2D1D1',
        },
        foreground: '#2D2A28',
        primary: '#6F8695',
        accent: '#DDB8B2',
        muted: '#F2D1D1',
        stroke: '#F2D1D1',
        input: '#DDB8B2',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#2D2A28',
            textAlign: 'left',
            a: {
              color: '#6F8695',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            h1: {
              fontFamily: 'Fraunces, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: '600',
              lineHeight: '1.2',
              marginTop: '1rem',
            },
            h2: {
              fontFamily: 'Fraunces, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '500',
              lineHeight: '1.3',
              marginTop: '1rem',
            },
            h3: {
              fontFamily: 'Fraunces, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: '500',
              lineHeight: '1.4',
              marginTop: '0',
            },
            p: {
              fontFamily: '"Libertinus Serif", serif',
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
              fontWeight: '400',
              lineHeight: '1.6',
            },
            img: {
              borderRadius: '16px',
              margin: '1rem 0',
              maxWidth: '100%',
              height: 'auto',
            },
            iframe: {
              borderRadius: '16px',
              margin: '1rem 0',
            },
            code: {
              fontFamily: 'Fira Mono',
              fontSize: 'clamp(0.875rem, 1rem, 1.125rem)',
              fontWeight: '400',
              lineHeight: '1.6',
              backgroundColor: '#F2D1D1',
              color: '#2D2A28',
              borderRadius: '4px',
              padding: '0.15rem 0.35rem',
              display: 'inline',
              '&::before': {
                content: 'none',
              },
              '&::after': {
                content: 'none',
              },
            },
            'p > code': {
              '&::before': {
                content: 'none',
              },
              '&::after': {
                content: 'none',
              },
            },
            pre: {
              fontFamily: 'Fira Mono',
              fontSize: 'clamp(0.9rem, 1.125rem, 1.25rem)',
              lineHeight: '1.6',
              backgroundColor: '#F2D1D1',
              color: '#2D2A28',
              borderRadius: '8px',
              padding: '1rem',
              overflowX: 'auto',
            },
            blockquote: {
              fontStyle: 'italic',
              borderLeft: '4px solid #DDB8B2',
              paddingLeft: '1rem',
              textAlign: 'left',
            },
            ul: {
              listStyleType: 'disc',
              paddingLeft: '1.25rem',
              listStylePosition: 'inside',
            },
            ol: {
              listStyleType: 'decimal',
              paddingLeft: '1.25rem',
              listStylePosition: 'inside',
            },
            li: {
              marginBottom: '0.5rem',
              '& p': {
                display: 'inline',
                margin: '0',
              },
            },
          },
        },
        dark: {
          css: {
            color: '#2D2A28',
            a: {
              color: '#6F8695',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            blockquote: {
              borderLeftColor: 'var(--gray-700)',
            },
          },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate, typography],
  safelist: [
    'grid-cols-1',
    'sm:grid-cols-2',
    'lg:grid-cols-3',
    'lg:grid-cols-4',
    'backdrop-blur-md',
    'rounded-2xl',
    'rounded-xl',
    'rounded-lg',
    'aspect-[4/5]',
    'ring-white',
    'min-h-[200px]',
    'lg:grid-cols-[35%_20%_20%_25%]',
  ],
};

export default config;
