import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // 主色系
        primary: {
          50: '#fff0f3',
          100: '#ffe0e6',
          200: '#ffc6d1',
          300: '#ffb5c2', // 淡粉主色
          400: '#ff8fa3',
          500: '#ff6b85',
          600: '#ff4766',
          700: '#e62e4d',
          800: '#bf2540',
          900: '#991f34',
        },
        // 辅色-薄荷绿
        mint: {
          50: '#eefbf7',
          100: '#d5f5eb',
          200: '#aeedd9',
          300: '#98d8c8', // 薄荷绿主色
          400: '#5ec4a8',
          500: '#3aab8e',
          600: '#2a8c74',
          700: '#237160',
          800: '#1f5a4e',
          900: '#1b4a41',
        },
        // 辅色-柔和紫
        lavender: {
          50: '#f5f0fa',
          100: '#ede5f5',
          200: '#d9c9ea',
          300: '#c3aed6', // 柔和紫主色
          400: '#a78bbe',
          500: '#8b69a6',
          600: '#71508c',
          700: '#5c4073',
          800: '#4a345d',
          900: '#3d2b4e',
        },
        // 辅色-暖黄
        honey: {
          50: '#fff9eb',
          100: '#fff0cc',
          200: '#ffe5a0', // 暖黄主色
          300: '#ffd966',
          400: '#ffcc33',
          500: '#e6b300',
          600: '#cc9f00',
          700: '#a68000',
          800: '#806300',
          900: '#594500',
        },
        // 中性色
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      fontFamily: {
        sans: ['Nunito', 'Source Han Sans SC', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.1)',
        float: '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
export default config
