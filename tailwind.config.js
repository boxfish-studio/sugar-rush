module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        blue: {
          lightest: '#EBF3FF',
          lighter: '#C8DEFF',
          light: '#84B5FF',
          regular: '#4081FF',
          dark: '#0057FF',
        },
        red: {
          light: '#FFE0E0',
          regular: '#FF5C5C',
        },
        green: {
          light: '#EBFFEF',
          regular: '#27AE60',
        },
        gray: {
          lighter: '#F0F3F6',
          light: '#E5E5E5',
          regular: '#C4C4C4',
          dark: '#999999',
          darkest: '#333333',
        },
      },
    },
  },
  plugins: [],
}
