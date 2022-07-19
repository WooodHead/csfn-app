module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/eslint-config-typescript'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    /*'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',*/
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'ban-ts-ignore': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/camelcase': 'off'
  }
}
