module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
  },
  ignorePatterns: [
    'node_modules/',
    // Ignore compiled files (not in .ignore directories)
    'components/*/*.js',
    'scripts/*.js',
    // But DO lint source files in .ignore directories
    '!components/**/.ignore/*.js',
    '!scripts/.ignore/*.js',
  ],
};
