import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        blink: 'blink 1s ease-in-out infinite',
      },
    },
  },
  // Les classes de couleur par piste sont écrites en toutes lettres dans
  // src/lib/theme.ts (pas de construction dynamique), donc pas besoin de safelist.
  plugins: [],
} satisfies Config
