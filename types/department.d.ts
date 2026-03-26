export {};

declare global {
  interface Department {
    created_at?: string; // ISO datetime string
    deleted_at?: null | string;
    id: number;
    title_en: string;
    title_ru: string;
    title_uz: string;
    updated_at?: null | string; // can be null
    users_in_percent?: number | string;
    "users-count"?: number;
  }
}
