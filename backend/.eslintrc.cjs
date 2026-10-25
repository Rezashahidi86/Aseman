module.exports = {
  root: true,
  env: {
    node: true,
    es2025: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: [
    'airbnb-base',
    'plugin:node/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'off',
    'no-underscore-dangle': [
      'error',
      {
        allow: ['_id', '__v'],
      },
    ],
    'no-param-reassign': [
      'error',
      {
        props: false,
      },
    ],
    'consistent-return': 'off',
    'no-process-exit': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'always',
      },
    ],
  },
};
