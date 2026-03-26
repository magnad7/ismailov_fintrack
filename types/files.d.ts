export {};

declare global {
  interface FileBreadcrumbItem {
    id: number;
    name: string;
    type: string;
  }

  interface FileItem {
    author: string;
    date: number;
    file_url?: string;
    id: number;
    mime_type?: string;
    name: string;
    parent_id?: number;
    size?: string;
    type: string;
  }
}
