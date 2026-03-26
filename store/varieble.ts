export interface MenuItem {
  icon: string;
  id: number;
  name: string;
  path: string;
  title: string;
}

type Role = "admin" | "employee";
export const useVariebleStore = defineStore("variebleStore", () => {
  const list = ref<Record<Role, MenuItem[]>>({
    admin: [
      {
        icon: "monitor",
        id: 1,
        name: "transactions",
        path: "/cabinet/admin/transactions",
        title: "Транзакции",
      },
      {
        icon: "users",
        id: 2,
        name: "employees",
        path: "/cabinet/admin/employees",
        title: "Сотрудники",
      },
      {
        icon: "list",
        id: 3,
        name: "expense-types",
        path: "/cabinet/admin/expense-types",
        title: "Типы расходов",
      },
      {
        icon: "message",
        id: 4,
        name: "chats",
        path: "/cabinet/admin/chats",
        title: "Чаты",
      },
      {
        icon: "calendar",
        id: 5,
        name: "calendar",
        path: "/cabinet/admin/calendar",
        title: "Календарь",
      },
    ],
    employee: [
      {
        icon: "monitor",
        id: 1,
        name: "dashboard",
        path: "/cabinet/employee/dashboard",
        title: "Мои транзакции",
      },
      {
        icon: "message",
        id: 2,
        name: "chats",
        path: "/cabinet/employee/chats",
        title: "Чаты",
      },
      {
        icon: "calendar",
        id: 3,
        name: "calendar",
        path: "/cabinet/employee/calendar",
        title: "Календарь",
      },
    ],
  });

  const priority = ["default", "low", "medium", "high"] as const;

  const roles: Record<Role, string> = {
    admin: "Технический администратор",
    employee: "Сотрудник",
  };
  const unit_types = ["M", "M²", "M³", "ШТ", "ЧЕЛ", "Т", "ММ"] as const;
  return {
    list,
    priority,
    roles,
    unit_types,
  };
});
