import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{astro,js,ts,jsx,tsx,css}', './components/**/*.{astro,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        accent: ['"Great Vibes"', 'cursive'],
        body: ['Inter', 'sans-serif'],
        heading: ['"Playfair Display"', 'serif'],
        display: ['"Playfair Display"', 'serif'],
        code: ['Fira Mono', 'monospace'],
      },
      fontSize: {
        tagline: ['24px', '33.6px'],
        headline: ['56px', '64px'],
        h1: ['56px', '78.4px'],
        h2: ['36px', '50.4px'],
        h3: ['24px', '33.6px'],
        description: ['16px', '22.4px'],
        regular: ['16px', '24px'],
        bold: ['16px', '22.4px'],
        nav: ['16px', '22.4px'],
        code: ['14px', '16.8px'],
      },
      alignments: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
      colors: {
        bg: 'hsl(var(--bg))',
        surface: 'hsl(var(--surface))',
        'text-primary': 'hsl(var(--text))',
        muted: 'hsl(var(--muted))',
        stroke: 'hsl(var(--stroke))',
        background: {
          DEFAULT: 'var(--background-color)',
          muted: 'var(--background-color-muted)',
          variant: 'var(--background-variant-color)',
        },
        foreground: 'var(--foreground-color)',
        primary: 'var(--accent-color-light)',
        input: 'var(--input-color)',
        secondary: 'var(--accent-color-dark)',
        accent: 'var(--accent-color)',
        soft: 'var(--accent-color-soft)',
        blue: {
          DEFAULT: '#172940',
        },
        gray: {
          DEFAULT: '#F5F8FB',
          muted: '#A5B0BD',
          dark: '#42566E',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--foreground-color)',
            textAlign: 'left',
            a: {
              color: 'var(--accent-color)',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            h1: {
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: '400',
              lineHeight: '1.2',
              marginTop: '1rem',
            },
            h2: {
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '400',
              lineHeight: '1.3',
              marginTop: '1rem',
            },
            h3: {
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: '400',
              lineHeight: '1.4',
              marginTop: '0',
            },
            p: {
              fontFamily: 'Inter',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              fontWeight: '400',
              lineHeight: '1.75',
            },
            img: {
              borderRadius: '8px',
              margin: '1rem 0',
              maxWidth: '100%',
              height: 'auto',
            },
            iframe: {
              borderRadius: '8px',
              margin: '1rem 0',
            },
            code: {
              fontFamily: 'Fira Mono',
              fontSize: 'clamp(0.875rem, 1rem, 1.125rem)',
              fontWeight: '400',
              lineHeight: '1.6',
              backgroundColor: 'var(--background-color-muted)',
              color: 'var(--foreground-color)',
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
              backgroundColor: 'var(--background-color-muted)',
              color: 'var(--foreground-color)',
              borderRadius: '8px',
              padding: '1rem',
              overflowX: 'auto',
            },
            blockquote: {
              fontStyle: 'italic',
              borderLeft: '4px solid var(--accent-color)',
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
            color: 'var(--foreground-color)',
            a: {
              color: 'var(--accent-color)',
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
    'hover:bg-[#f5e1e0]',
    'hover:bg-[#850e35]',
    'active:bg-[#850e35]',
    'bg-[#f2d1d1]/70',
    'backdrop-blur-md',
    'bg-[#FCF5EE]',
    'aspect-[4/5]',
    'shadow-[0_10px_30px_rgba(133,14,53,0.08)]',
    "font-['Playfair_Display']",
    'text-[#850E35]',
    'bg-[#850E35]',
    'text-[#FCF5EE]',
    'hover:bg-[#6b0b2a]',
    'hover:shadow-[0_0_20px_rgba(133,14,53,0.3)]',
    'bg-[#f6f6f6]',
    'border-[#f5dcda]',
    'ring-white',
    'rounded-[1.75rem]',
    'min-h-[200px]',
  ],
};

export default config;
