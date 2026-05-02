import { config } from '@repo/eslint-config/base';

/** @type {import("eslint").Linter.Config} */
export default [
    ...config,
    {
        ignores: ['**/prisma/**', '**/generated/**'],
    },
    {
        files: ['**/*.spec.ts'],
        rules: {
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-unnecessary-type-parameters': 'off',
            '@typescript-eslint/require-await': 'off',
        },
    },
];
