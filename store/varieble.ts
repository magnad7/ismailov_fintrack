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
        icon: "menu-dashboard",
        id: 1, // Placeholder
        name: "dashboard", // Placeholder
        path: "/cabinet/admin/dashboard",
        title: "Dashboard",
      },
      {
        icon: "menu-transactions",
        id: 2, // Placeholder
        name: "transactions", // Placeholder
        path: "/cabinet/admin/transactions",
        title: "Transactions",
      },
      {
        icon: "menu-projects",
        id: 3, // Placeholder
        name: "projects", // Placeholder
        path: "/cabinet/admin/projects",
        title: "Projects",
      },
      {
        icon: "menu-employees",
        id: 4, // Placeholder
        name: "employees", // Placeholder
        path: "/cabinet/admin/employees",
        title: "Employees",
      },
      {
        icon: "menu-expenses",
        id: 5, // Placeholder
        name: "expense-types", // Placeholder
        path: "/cabinet/admin/expense-types",
        title: "Expense Types",
      },
      {
        icon: "menu-chats",
        id: 6, // Placeholder
        name: "chats", // Placeholder
        path: "/cabinet/admin/chats",
        title: "Chats",
      },
      {
        icon: "menu-calendar",
        id: 7, // Placeholder
        name: "calendar", // Placeholder
        path: "/cabinet/admin/calendar",
        title: "Calendar",
      },
    ],
    employee: [
      {
        icon: "menu-dashboard",
        id: 1, // Placeholder
        name: "dashboard", // Placeholder
        path: "/cabinet/employee/dashboard",
        title: "Dashboard",
      },
      {
        icon: "menu-transactions",
        id: 2, // Placeholder
        name: "transactions", // Placeholder
        path: "/cabinet/employee/transactions",
        title: "Transactions",
      },
      // {
      //   icon: "menu-projects",
      //   id: 3, // Placeholder
      //   name: "projects", // Placeholder
      //   path: "/cabinet/employee/projects",
      //   title: "Projects",
      // },
      {
        icon: "menu-chats",
        id: 4, // Placeholder
        name: "chats", // Placeholder
        path: "/cabinet/employee/chats",
        title: "Chats",
      },
      {
        icon: "menu-calendar",
        id: 5, // Placeholder
        name: "calendar", // Placeholder
        path: "/cabinet/employee/calendar",
        title: "Calendar",
      },
    ],
  });

  const priority = ["default", "low", "medium", "high"] as const;

  const roles: Record<Role, string> = {
    admin: "Administrator",
    employee: "Employee",
  };
  const unit_types = ["M", "M²", "M³", "ШТ", "ЧЕЛ", "Т", "ММ"] as const;
  return {
    list,
    priority,
    roles,
    unit_types,
  };
});
