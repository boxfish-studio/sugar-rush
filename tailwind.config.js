module.exports = {
    content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
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
            },
        },
    },
    plugins: [],
}
