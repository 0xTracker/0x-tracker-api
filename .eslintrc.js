module.exports = {
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  env: {
    jest: true,
    node: true,
  },
  overrides: [
    {
      files: ['jest/setup.js'],
      rules: { 'import/no-extraneous-dependencies': 'off' },
    },
  ],
  rules: {
    'no-underscore-dangle': 'off',
    'import/prefer-default-export': 'warn',
  },
};
