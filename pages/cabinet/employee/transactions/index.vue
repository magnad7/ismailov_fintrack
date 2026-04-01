<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";

import { ElMessage } from "element-plus";
import {
  addDoc,
  collection,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useCollection, useFirestore } from "vuefire";

import { useAuthStore } from "~/store/auth";

const db = useFirestore();
const authStore = useAuthStore();
const transactionsRef = collection(db, "transactions");
const q = computed(() =>
  query(transactionsRef, where("userId", "==", authStore.myId))
);
const { data: rawTransactions, pending } = useCollection(q);

const transactions = computed(() => {
  return rawTransactions.value.slice().sort((a: any, b: any) => {
    const da = a.createdAt?.toDate?.() ?? new Date(0);
    const db2 = b.createdAt?.toDate?.() ?? new Date(0);
    return db2.getTime() - da.getTime();
  });
});

const { data: projects } = useCollection(collection(db, "projects"));
const { data: expenseTypes } = useCollection(collection(db, "expense_types"));

const getProjectName = (pid: string) => {
  if (!pid || !projects.value) return "—";
  return projects.value.find((p: any) => p.id === pid)?.name || "—";
};

const { data: employees } = useCollection(collection(db, "users"));

const getUserName = (uid: string) => {
  if (!uid || !employees.value) return "—";
  return employees.value.find((e: any) => e.id === uid)?.name || "—";
};

const formatDate = (ts: any) => {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatAmount = (val: number) => {
  return new Intl.NumberFormat("ru-RU").format(val || 0) + " UZS";
};

// ──── Add Transaction Modal ────
const showAddModal = ref(false);
const formRef = ref<FormInstance>();
const isSaving = ref(false);

const form = reactive({
  amount: null as null | number,
  description: "",
  expenseType: "",
  projectId: "",
  type: "expense",
  userId: "",
});

const rules = reactive<FormRules>({
  amount: [{ message: "Amount is required", required: true, trigger: "blur" }],
  type: [{ message: "Type is required", required: true, trigger: "change" }],
});

const openAddModal = () => {
  form.type = "expense";
  form.amount = null;
  form.expenseType = "";
  form.projectId = "";
  form.description = "";
  form.userId = "";
  showAddModal.value = true;
  nextTick(() => {
    if (formRef.value) formRef.value.clearValidate();
  });
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async (valid) => {
    if (valid) {
      isSaving.value = true;
      try {
        await addDoc(collection(db, "transactions"), {
          amount: Number(form.amount),
          authorId: authStore.myId,
          authorRole: "employee",
          createdAt: Timestamp.now(),
          description: form.description || "",
          expenseType: form.expenseType || "Other",
          projectId: form.projectId || null,
          type: form.type,
          userId: authStore.myId,
        });
        ElMessage.success("Transaction successfully created!");
        showAddModal.value = false;
      } catch (error: any) {
        ElMessage.error("Error creating transaction: " + error.message);
      } finally {
        isSaving.value = false;
      }
    }
  });
};
</script>

<template>
  <div class="transactions-page">
    <!-- ──── Page Header ──── -->
    <div class="page-header">
      <div class="header-left">
        <span class="header-icon-box">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <line
              x1="12"
              y1="1"
              x2="12"
              y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </span>
        <h1 class="header-title">Transactions</h1>
      </div>
      <div class="header-right">
        <button
          class="primary-btn"
          @click="openAddModal">
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
          New Transaction
        </button>
      </div>
    </div>

    <!-- ──── Table ──── -->
    <div class="table-card">
      <el-table
        v-loading="pending"
        :data="transactions"
        style="width: 100%"
        :header-cell-style="{
          background: '#f9fafb',
          color: '#6b7280',
          fontWeight: 600,
          fontSize: '12.5px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          borderBottom: '1px solid #f0f0f0',
          padding: '14px 16px',
        }"
        :cell-style="{
          padding: '16px',
          borderBottom: '1px solid #f5f5f5',
          color: '#374151',
          fontSize: '14px',
        }">
        <el-table-column
          label="Date"
          width="160">
          <template #default="scope">
            <span class="cell-date">
              {{ formatDate(scope.row.createdAt) || "—" }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          label="Description"
          min-width="150">
          <template #default="scope">
            <span class="cell-description">
              {{ scope.row.description || "—" }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          label="Category"
          width="170">
          <template #default="scope">
            <span class="cell-category">
              {{ scope.row.expenseType || "—" }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          label="User"
          width="150">
          <template #default="scope">
            <span class="cell-user">
              {{ getUserName(scope.row.userId) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          label="Project"
          width="150">
          <template #default="scope">
            {{ getProjectName(scope.row.projectId) }}
          </template>
        </el-table-column>

        <el-table-column
          label="Amount"
          width="180"
          align="right">
          <template #default="scope">
            <span
              class="cell-amount"
              :class="scope.row.type === 'income' ? 'text-green' : 'text-red'">
              {{ scope.row.type === "income" ? "+" : "-"
              }}{{ formatAmount(scope.row.amount) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          label="Type"
          width="120"
          align="center">
          <template #default="scope">
            <span
              class="type-badge"
              :class="scope.row.type">
              {{ scope.row.type === "income" ? "Income" : "Expense" }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ──── Create Transaction Dialog ──── -->
    <el-dialog
      v-model="showAddModal"
      title="New Transaction"
      width="440px"
      append-to-body
      destroy-on-close
      class="premium-modal">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top">
        <el-form-item prop="type">
          <el-radio-group
            v-model="form.type"
            class="segmented-control w-full">
            <el-radio-button
              label="income"
              value="income">
              Income
            </el-radio-button>
            <el-radio-button
              label="expense"
              value="expense">
              Expense
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="Amount"
          prop="amount">
          <el-input-number
            v-model="form.amount"
            :min="0"
            :controls="false"
            style="width: 100%"
            placeholder="0.00" />
        </el-form-item>

        <el-form-item label="Category">
          <el-select
            v-model="form.expenseType"
            placeholder="Select category"
            filterable
            allow-create
            class="w-full">
            <el-option
              v-for="item in expenseTypes"
              :key="item.id"
              :label="item.name"
              :value="item.name" />
          </el-select>
        </el-form-item>

        <el-form-item label="Project">
          <el-select
            v-model="form.projectId"
            placeholder="Select project"
            clearable
            filterable
            class="w-full">
            <el-option
              v-for="proj in projects"
              :key="proj.id"
              :label="proj.name"
              :value="proj.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="Description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="Transaction description..." />
        </el-form-item>

        <button
          type="button"
          class="premium-btn mt-2"
          :class="{ 'is-loading': isSaving }"
          @click.prevent="submitForm(formRef)">
          <span v-if="isSaving">Saving...</span>
          <span v-else>Save Transaction</span>
        </button>
      </el-form>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
/* ──── Layout ──── */
.transactions-page {
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

/* ──── Buttons ──── */
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

.cell-date {
  font-size: 13.5px;
  font-weight: 500;
  color: #6b7280;
}

.cell-description {
  font-weight: 500;
  color: #374151;
}

.cell-category,
.cell-user {
  font-weight: 500;
  color: #6b7280;
}

.cell-amount {
  font-family: "JetBrains Mono", monospace;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.5px;

  &.text-green {
    color: #059669;
  }

  &.text-red {
    color: #dc2626;
  }
}

.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  border-radius: 20px;

  &.income {
    color: #059669;
    background: #ecfdf5;
  }

  &.expense {
    color: #dc2626;
    background: #fef2f2;
  }
}
</style>
