<script setup lang="ts">
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useCollection, useFirestore } from "vuefire";

const db = useFirestore();
const typesRef = collection(db, "expense_types");
const { data: expenseTypes, pending } = useCollection(typesRef);

const dialogVisible = ref(false);
const newType = ref("");

const openCreateDialog = () => {
  newType.value = "";
  dialogVisible.value = true;
};

const addType = async () => {
  if (!newType.value.trim()) return;
  await addDoc(typesRef, { createdAt: serverTimestamp(), name: newType.value });
  newType.value = "";
  dialogVisible.value = false;
  ElMessage.success("Expense type created");
};

const removeType = async (id: string) => {
  ElMessageBox.confirm(
    "Are you sure you want to delete this expense type?",
    "Warning",
    {
      cancelButtonText: "Cancel",
      confirmButtonText: "Delete",
      type: "warning",
    }
  )
    .then(async () => {
      await deleteDoc(doc(db, "expense_types", id));
      ElMessage.success("Expense type deleted");
    })
    .catch(() => {});
};
</script>

<template>
  <div class="admin-expense-page">
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
            <path
              d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line
              x1="7"
              y1="7"
              x2="7.01"
              y2="7" />
          </svg>
        </span>
        <h1 class="header-title">Expense Types</h1>
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
          New Type
        </button>
      </div>
    </div>

    <!-- Table Card -->
    <div class="table-card">
      <el-table
        v-loading="pending"
        :data="expenseTypes"
        style="width: 100%">
        <el-table-column
          prop="name"
          label="Name"
          min-width="200">
          <template #default="scope">
            <span class="cell-name">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Actions"
          width="120"
          align="center">
          <template #default="scope">
            <button
              class="delete-btn"
              @click="removeType(scope.row.id)">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete
            </button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Create Dialog -->
    <el-dialog
      v-model="dialogVisible"
      title="New Expense Type"
      width="440px"
      destroy-on-close
      class="premium-modal">
      <el-form label-position="top">
        <el-form-item
          label="Type Name"
          required>
          <el-input
            v-model="newType"
            placeholder="e.g. Office Supplies" />
        </el-form-item>

        <button
          type="button"
          class="premium-btn mt-2"
          @click.prevent="addType">
          Save Type
        </button>
      </el-form>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.admin-expense-page {
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

.cell-name {
  font-weight: 600;
  color: #374151;
}

.delete-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: #dc2626;
  cursor: pointer;
  background: #fef2f2;
  border: none;
  border-radius: 8px;
  transition: all 0.15s ease;

  &:hover {
    color: #fff;
    background: #dc2626;
  }
}
</style>
