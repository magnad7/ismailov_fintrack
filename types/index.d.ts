export {};

declare global {
  interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    status: boolean;
  }

  interface Employee {
    active: boolean;
    date_of_hiring: string;
    department: {
      en: string;
      ru: string;
      uz: string;
    };
    department_id: number | string;
    email: string;
    fullname: string;
    given_name: string;
    id: number;
    job_title_id: number | string;
    last_login_at: string;
    name: string;
    password: string;
    password_confirmation: string;
    patronymic: string;
    personnel_number: string;
    phone: string;
    position: string;
    role: string;
    surname: string;
  }

  interface EmployeeForm {
    active?: boolean;
    address?: string;
    birthday?: string;
    date_of_hiring?: string;
    department?: {
      en: string;
      ru: string;
      uz: string;
    };
    department_id?: null | number | string;
    email: string;
    given_name: string;
    handmade_signature?: string;
    job_title?: {
      en: string;
      ru: string;
      uz: string;
    };
    job_title_id?: null | number | string;
    name: string;
    password: string;
    password_confirmation: string;
    patronymic: string;
    personnel_number?: string;
    phone?: string;
    photo?: string;
    role: null | string;
    roles?: { name: string }[];
    surname: string;
  }

  interface ErrorResponse {
    _data: {
      data?: Record<string, unknown> | string;
      error?: Record<string, unknown> | string;
      errors?: Record<string, unknown> | string;
      message?: string;
    };
    status?: number;
  }

  interface Pagination<T> {
    current: number;
    current_page?: number;
    data?: T[];
    items?: T[];
    per_page?: number;
    size: number;
    total: number;
  }

  type PriorityType = "default" | "high" | "low" | "medium";

  type QueryParams = Record<string, QueryValue>;

  type QueryValue = boolean | null | number | string | undefined;

  type ValidationMessages = Record<string, string>;
}
