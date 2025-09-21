export default {
  plugins: {
    tailwindcss: {},
    'postcss-preset-env': {
      stage: 2,
      autoprefixer: {
        grid: true
      },
      features: {
        'custom-properties': false,
        'nesting-rules': true
      }
    }
  },
}
