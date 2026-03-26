export {};

declare global {
  interface OrderPayload {
    approvers: number[];
    deadline: string;
    details: string;
    is_all: boolean | number;
    order_source: "standalone" | "statement_based";
    order_type_id: null | number;
    priority: PriorityType;
    responsible_persons: string;
    statement_id?: null | number;
    target_users: number[];
    title: string;
  }

  interface OrderStatement {
    author?: string;
    end_date?: string;
    id?: null | number;
    reason?: string;
    start_date?: string;
    status?: string;
    title: string;
  }

  interface OrderType {
    active: boolean | string;
    created_at?: string; // ISO datetime string
    deleted_at?: null | string;
    id?: number;
    template_document: File | null;
    title_en: string;
    title_ru: string;
    title_uz: string;
    updated_at?: null | string; // can be null
  }
}
