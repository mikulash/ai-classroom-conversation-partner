import 'i18next';
import type { DefaultNS, Resources } from '@repo/frontend-utils/src/translation/resources';

// Makes `t('...')` keys type-checked against the canonical English resource.
// A typo or stale key becomes a compile error instead of silently rendering
// the raw key at runtime.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: DefaultNS;
    resources: Resources;
  }
}
