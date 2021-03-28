module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  plugins: [
    'vue'
  ],
  rules: {
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
