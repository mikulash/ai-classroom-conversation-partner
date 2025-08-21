import { API_KEY } from '../enums/ApiKey.js';

export type ApiKey = (typeof API_KEY)[keyof typeof API_KEY];
