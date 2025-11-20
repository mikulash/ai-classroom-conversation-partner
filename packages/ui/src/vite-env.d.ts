// / <reference types="vite/client" />

interface ImportMetaEnv {
    MODE: string;
    readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
