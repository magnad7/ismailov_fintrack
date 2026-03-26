export {};

declare global {
  interface Approval {
    approved_at?: string;
    approver_fullname?: string;
    comment?: string;
    created_at?: string;
    deleted_at?: null | string;
    handmade_signature?: string;
    id?: number;
    statement?: number;
    status:
      | "accept"
      | "approve"
      | "decline"
      | "pending"
      | "reject"
      | "rejected";
    updated_at?: string;
    user?: number;
  }

  interface Statement {
    cause: string;
    end_date: string;
    id?: number;
    start_date: string;
    statement_type: string;
  }

  interface StatementPending {
    approvals?: Approval[];
    author: {
      department?: {
        [key: string]: string;
        en: string;
        ru: string;
        uz: string;
      };
      fullname: string;
    };
    create_date: string;
    id: number;
    priority: string;
    reason?: string;
    statement_type?: {
      [key: string]: string;
      en: string;
      ru: string;
      uz: string;
    };
    status:
      | "accept"
      | "approve"
      | "decline"
      | "pending"
      | "reject"
      | "rejected";
  }

  interface StatementType {
    active: boolean | string;
    created_at?: string; // ISO datetime
    deleted_at?: null | string;
    id?: number;
    template_document: File | null | object | string;
    title_en: string;
    title_ru: string;
    title_uz: string;
    updated_at?: string; // ISO datetime
  }

  interface StatisticsResponse {
    activity: number;
    "administrators-count": number;
    "all_users-count": number;
    departments: Department[];
    "departments-count": number;
  }
}
