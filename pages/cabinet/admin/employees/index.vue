<script setup lang="ts">
import { collection } from "firebase/firestore";
import { useCollection, useFirestore } from "vuefire";

const db = useFirestore();
const usersRef = collection(db, "users");
const { data: users, pending } = useCollection(usersRef);

const dialogVisible = ref(false);
const loading = ref(false);
const formParams = ref({
  email: "",
  name: "",
  password: "",
  phone: "",
  role: "employee",
});

const openCreateDialog = () => {
  formParams.value = {
    email: "",
    name: "",
    password: "",
    phone: "",
    role: "employee",
  };
  dialogVisible.value = true;
};

const onAddEmployee = async () => {
  if (!formParams.value.name.trim() || !formParams.value.email.trim()) return;
  loading.value = true;
  try {
    await $fetch("/api/create-employee", {
      body: formParams.value,
      method: "POST",
    });
    dialogVisible.value = false;
    ElMessage.success("Employee added successfully");
  } catch (err: any) {
    ElMessage.error(err.data?.message || "Error adding employee");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="admin-employees-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <span class="header-icon-box">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle
              cx="9"
              cy="7"
              r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </span>
        <h1 class="header-title">Employees</h1>
      </div>
      <div class="header-right">
        <button
          class="primary-btn"
          @click="openCreateDialog">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="margin-right: 6px">
            <line
              x1="12"
              y1="5"
              x2="12"
              y2="19" />
            <line
              x1="5"
              y1="12"
              x2="19"
              y2="12" />
          </svg>
          New Employee
        </button>
      </div>
    </div>

    <!-- Table Card -->
    <div class="table-card">
      <el-table
        v-loading="pending"
        :data="users"
        style="width: 100%">
        <el-table-column
          label="Name"
          min-width="180">
          <template #default="scope">
            <div class="user-cell">
              <div class="user-avatar">
                {{ scope.row.name?.charAt(0)?.toUpperCase() || "?" }}
              </div>
              <span class="user-name">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="email"
          label="Email"
          min-width="200">
          <template #default="scope">
            <span class="cell-email">{{ scope.row.email }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="phone"
          label="Phone"
          min-width="150">
          <template #default="scope">
            <span class="cell-phone">{{ scope.row.phone || "—" }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Role"
          width="130"
          align="center">
          <template #default="scope">
            <span
              class="role-badge"
              :class="scope.row.role">
              {{ scope.row.role === "admin" ? "Admin" : "Employee" }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Create Employee Dialog -->
    <el-dialog
      v-model="dialogVisible"
      title="New Employee"
      width="440px"
      destroy-on-close
      class="premium-modal">
      <el-form
        :model="formParams"
        label-position="top">
        <el-form-item
          label="Full Name"
          required>
          <el-input
            v-model="formParams.name"
            placeholder="John Doe" />
        </el-form-item>
        <el-form-item
          label="Email"
          required>
          <el-input
            v-model="formParams.email"
            type="email"
            placeholder="john@company.com" />
        </el-form-item>
        <el-form-item
          label="Password"
          required>
          <el-input
            v-model="formParams.password"
            type="password"
            show-password
            placeholder="Minimum 6 characters" />
        </el-form-item>
        <el-form-item label="Phone">
          <el-input
            v-model="formParams.phone"
            placeholder="+998 90 123 45 67" />
        </el-form-item>
        <el-form-item
          label="Role"
          required>
          <el-select
            v-model="formParams.role"
            class="w-full">
            <el-option
              label="Employee"
              value="employee" />
            <el-option
              label="Admin"
              value="admin" />
          </el-select>
        </el-form-item>

        <button
          type="button"
          class="premium-btn mt-2"
          :class="{ 'is-loading': loading }"
          @click.prevent="onAddEmployee">
          <span v-if="loading">Saving...</span>
          <span v-else>Save Employee</span>
        </button>
      </el-form>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.admin-employees-page {
  min-height: 100vh;
}

/* ──── Header ──── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;

  .header-left {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .header-icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    color: #6366f1;
    background: #eef2ff;
    border-radius: 10px;
  }

  .header-title {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.3px;
  }
}

.primary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: #6366f1;
  border: none;
  border-radius: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: #4f46e5;
    box-shadow: 0 4px 6px rgb(99 102 241 / 25%);
    transform: translateY(-1px);
  }
}

/* ──── Table Card ──── */
.table-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 5%),
    0 2px 4px -2px rgb(0 0 0 / 5%);

  :deep(.el-table) {
    --el-table-border-color: transparent;

    overflow: hidden;
    border-radius: 16px;
  }

  :deep(.el-table::before) {
    display: none;
  }
}

/* ──── User Cell ──── */
.user-cell {
  display: flex;
  gap: 10px;
  align-items: center;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 13px;
  font-weight: 700;
  color: #6366f1;
  background: #eef2ff;
  border-radius: 50%;
}

.user-name {
  font-weight: 600;
  color: #111827;
}

.cell-email {
  font-weight: 500;
  color: #6b7280;
}

.cell-phone {
  font-weight: 500;
  color: #6b7280;
}

/* ──── Role Badge ──── */
.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  border-radius: 20px;

  &.admin {
    color: #dc2626;
    background: #fef2f2;
  }

  &.employee {
    color: #059669;
    background: #ecfdf5;
  }
}
</style>
