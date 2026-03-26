export {};

declare global {
  interface Job {
    created_at?: string; // ISO datetime string
    deleted_at?: null | string;
    id?: number | undefined;
    title_en: string;
    title_ru: string;
    title_uz: string;
    updated_at?: null | string; // can be null
  }
}
