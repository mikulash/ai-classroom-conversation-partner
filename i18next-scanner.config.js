// i18next-scanner.config.js
module.exports = {
  input: [
    'packages/**/*.{js,jsx,ts,tsx}',
    '!packages/**/*.test.{js,jsx,ts,tsx}',
    '!packages/**/*.spec.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
  ],
  // <─ write files right where the existing ones are
  output: './packages/ui/lib/locales/',
  options: {
    debug: true,

    func: {
      list: ['t', 'i18next.t', 'i18n.t'],
      extensions: ['.jsx', '.tsx'],
    },

    lngs: ['en', 'cs'],
    ns: ['translation'],
    defaultLng: 'en',
    defaultNs: 'translation',

    /** * IMPORTANT CHANGES ***/
    // 1. Tell the scanner where to read the current JSONs
    resource: {
      loadPath: 'packages/ui/lib/locales/{{lng}}.json',
      // 2. Keep the existing save path (relative to `output`)
      savePath: '{{lng}}.json',
      jsonIndent: 2,
      lineEnding: '\n',
    },

    // 3. Merge with existing translations instead of overwriting
    //    (just delete the line altogether – default is false)
    // updateOnly: true,
    /** * ----------------------------------------------- ***/

    removeUnusedKeys: false, // keep keys you no longer use in code
    sort: true, // keep keys sorted (optional)
    skipDefaultValues: true, // don’t touch values that already exist
    nsSeparator: ':',
    keySeparator: '.',
    pluralSeparator: '_',
    contextSeparator: '_',
    interpolation: { prefix: '{{', suffix: '}}' },
  },
};
