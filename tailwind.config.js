const colors = require('tailwindcss/colors')
const { theme: baleada } = require('@baleada/tailwind-theme')

module.exports = {
  mode: 'jit',
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    ...baleada,
    extend: {
      colors: {
        gray: colors.blueGray,
      }
    }
  },
  plugins: [],
}
