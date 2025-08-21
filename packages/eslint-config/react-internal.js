import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import { config as baseConfig } from './base.js';
import i18next from 'eslint-plugin-i18next';

export const config = [
  ...baseConfig, // inherits the formatting rules above
  pluginReact.configs.flat.recommended,
  i18next.configs['flat/recommended'],

  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: { ...globals.browser, ...globals.serviceworker },
    },
    settings: { react: { version: 'detect' } },
    plugins: { 'react-hooks': pluginReactHooks },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
];

