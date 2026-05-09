/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly VITE_API_URL_SECURITY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}