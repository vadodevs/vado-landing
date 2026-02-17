module.exports = {
  root: true,
  env: {
    browser: true,
    es2023: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'tailwindcss', // plugin de Tailwind
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:tailwindcss/recommended', // reglas recomendadas para Tailwind
    'prettier', // hace que ESLint y Prettier no se peleen
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // ejemplos de reglas útiles:
    'tailwindcss/no-unknown-classname': 'error', // marca clases inválidas
    'react/react-in-jsx-scope': 'off', // con React 17+ no hace falta importar React
    '@typescript-eslint/explicit-function-return-type': 'off', // opcional
  },
}
