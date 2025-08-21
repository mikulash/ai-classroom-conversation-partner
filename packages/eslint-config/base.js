import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import turboPlugin from 'eslint-plugin-turbo';
import onlyWarn from 'eslint-plugin-only-warn';
import google from 'eslint-config-google';
import i18next from 'eslint-plugin-i18next';

/**
 * Shared ESLint config – no Prettier,
 * but formatting rules turned ON.
 *
 * @type {import('eslint').Linter.FlatConfig[]}
 */
export const config = [
  /* core recommendations */
  js.configs.recommended,
  google,
  ...tseslint.configs.recommended,
  i18next.configs['flat/recommended'],
  {
    rules: {
      'indent': ['error', 2, { SwitchCase: 1, VariableDeclarator: 1 }],
      'semi': ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'max-len': 'off',
      'require-jsdoc': 'off',
      'valid-jsdoc': 'off',
      'no-unused-vars': 'off',
      'no-explicit-any': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'linebreak-style': 'off',
      'camelcase': 'off',
      'new-cap': 'off',
    },
  },

  /* monorepo / CI niceties */
  {
    plugins: { turbo: turboPlugin },
    rules: { 'turbo/no-undeclared-env-vars': 'warn' },
  },
  { plugins: { onlyWarn } },

  /* housekeeping */
  { ignores: ['dist/**', '**/vite-env.d.ts', 'src-tauri/**'] },
];
