<script setup lang="ts">
import { collection, query, where } from "firebase/firestore";
import { useCollection, useFirestore } from "vuefire";

import TransactionModal from "~/components/custom/TransactionModal.vue";
import { useAuthStore } from "~/store/auth";

const db = useFirestore();
const authStore = useAuthStore();
const userId = authStore.myId;

const showTransactionModal = ref(false);

const transactionsRef = collection(db, "transactions");
const q = query(transactionsRef, where("userId", "==", userId));
const { data: transactions, pending } = useCollection(q);

const projectsRef = collection(db, "projects");
const { data: projects } = useCollection(projectsRef);

const totalIncome = computed(() => {
  return transactions.value
    .filter((t: any) => t.type === "income")
    .reduce((acc: any, curr: any) => acc + (curr.amount || 0), 0);
});

const totalExpense = computed(() => {
  return transactions.value
    .filter((t: any) => t.type === "expense")
    .reduce((acc: any, curr: any) => acc + (curr.amount || 0), 0);
});

const balance = computed(() => totalIncome.value - totalExpense.value);

const sortedTransactions = computed(() => {
  return [...transactions.value]
    .sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : 0;
      return dateB - dateA;
    })
    .slice(0, 10);
});

const getProjectName = (projectId: string) => {
  const proj = projects.value.find((p) => p.id === projectId);
  return proj ? proj.name : "Noma'lum";
};
</script>

<template>
  <div class="employee-dashboard p-6 pb-20">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          Mening Ko'rsatkichlarim
        </h1>
        <p class="text-gray-500 text-sm mt-1">
          Sizning joriy oydagi (yoki umumiy) xarajat va daromadlaringiz
        </p>
      </div>
      <el-button
        type="primary"
        size="large"
        class="!rounded-lg shadow-md hover:shadow-lg transition-all"
        @click="showTransactionModal = true">
        <el-icon class="mr-2"><Plus /></el-icon>
        Tranzaksiya qo'shish
      </el-button>
    </div>

    <!-- Stats -->
    <el-row
      :gutter="20"
      class="mb-8">
      <el-col :span="8">
        <el-card
          shadow="hover"
          class="stat-card balance-card">
          <div class="stat-icon bg-blue-100 text-blue-600">
            <el-icon :size="24"><Wallet /></el-icon>
          </div>
          <div class="stat-content">
            <p class="stat-title">Shaxsiy Balans</p>
            <h2 class="stat-value text-blue-700">
              {{ balance > 0 ? "+" : "" }}{{ balance.toLocaleString() }}
            </h2>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card
          shadow="hover"
          class="stat-card income-card">
          <div class="stat-icon bg-green-100 text-green-600">
            <el-icon :size="24"><TopRight /></el-icon>
          </div>
          <div class="stat-content">
            <p class="stat-title">Daromadlar</p>
            <div class="text-2xl font-bold text-green-600">
              +{{ totalIncome.toLocaleString() }}
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card
          shadow="hover"
          class="stat-card expense-card">
          <div class="stat-icon bg-red-100 text-red-600">
            <el-icon :size="24"><BottomRight /></el-icon>
          </div>
          <div class="stat-content">
            <p class="stat-title">Xarajatlar</p>
            <div class="text-2xl font-bold text-red-600">
              -{{ totalExpense.toLocaleString() }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Table -->
    <el-card
      class="table-card !border-gray-100 !rounded-2xl"
      shadow="never">
      <template #header>
        <span class="font-bold text-gray-700 text-lg">
          So'nggi Tranzaksiyalar
        </span>
      </template>
      <el-table
        v-loading="pending"
        :data="sortedTransactions"
        style="width: 100%"
        size="large"
        stripe>
        <el-table-column
          prop="type"
          label="Turi"
          width="120">
          <template #default="scope">
            <el-tag
              :type="scope.row.type === 'income' ? 'success' : 'danger'"
              effect="light"
              round>
              {{ scope.row.type === "income" ? "Daromad (+)" : "Xarajat (-)" }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Kategoriya">
          <template #default="scope">
            {{ scope.row.expenseType || "Kategoriyasiz" }}
          </template>
        </el-table-column>

        <el-table-column
          label="Loyiha"
          min-width="150">
          <template #default="scope">
            <el-tag
              size="small"
              type="info"
              class="border-0 bg-gray-100 text-gray-700">
              {{ getProjectName(scope.row.projectId) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          label="Izoh"
          min-width="200"
          show-overflow-tooltip>
          <template #default="scope">
            <span class="text-gray-500 text-sm">
              {{ scope.row.description || "—" }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          label="Sana"
          width="160">
          <template #default="scope">
            <span class="text-gray-500">
              {{
                scope.row.createdAt?.toDate
                  ? new Date(scope.row.createdAt.toDate()).toLocaleString([], {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"
              }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="amount"
          label="Summa"
          align="right"
          width="150">
          <template #default="scope">
            <span
              :class="[
                'font-extrabold text-lg',
                scope.row.type === 'income' ? 'text-green-600' : 'text-red-600',
              ]">
              {{ scope.row.type === "income" ? "+" : "-"
              }}{{ scope.row.amount?.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Global Modal Instance -->
    <TransactionModal v-model="showTransactionModal" />
  </div>
</template>

<style lang="scss" scoped>
.stat-card {
  border: none;
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 5%),
    0 2px 4px -1px rgb(0 0 0 / 3%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    box-shadow:
      0 10px 15px -3px rgb(0 0 0 / 10%),
      0 4px 6px -2px rgb(0 0 0 / 5%) !important;
    transform: translateY(-2px);
  }

  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    padding: 24px;
  }

  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    margin-right: 20px;
    border-radius: 20px;
  }

  .stat-content {
    .stat-title {
      margin: 0 0 6px;
      font-size: 14px;
      font-weight: 600;
      color: #909399;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
}

.table-card {
  :deep(.el-card__header) {
    padding: 20px 24px;
    border-bottom: 1px solid #f3f4f6;
  }
}
</style>
