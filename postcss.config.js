export default {
  plugins: {
    tailwindcss: {},
    'postcss-preset-env': {
      stage: 1,
      autoprefixer: {
        grid: true,
        flexbox: 'no-2009',
        overrideBrowserslist: [
          '> 1%',
          'last 2 versions',
          'not dead',
          'not ie 11',
          'Chrome >= 54',
          'Firefox >= 60',
          'Safari >= 12',
          'Edge >= 79'
        ]
      },
      features: {
        'custom-properties': false,
        'nesting-rules': true,
        'color-functional-notation': false,
        'text-size-adjust': true,
        'appearance': true,
        'line-clamp': true
      }
    }
  },
}
