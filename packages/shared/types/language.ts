import { LANGUAGE } from '../enums/Language.js';

export type Language = (typeof LANGUAGE)[keyof typeof LANGUAGE];
