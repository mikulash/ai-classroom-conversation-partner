// Type-only description of the i18n resources, derived from the canonical
// English locale. Imported by the i18next module augmentation in `@repo/ui`
// so that `t('...')` keys are checked at compile time.
//

export type DefaultNS = 'translation';

export interface Resources {
  translation: typeof import('./locales/en.json');
}
