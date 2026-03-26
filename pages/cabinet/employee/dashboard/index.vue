<script setup lang="ts">
import { collection, orderBy, query, where } from "firebase/firestore";
import { useCollection, useFirestore } from "vuefire";

const db = useFirestore();
const authStore = useAuthStore();
const userId = authStore.myId;

const transactionsRef = collection(db, "transactions");
const q = query(transactionsRef, where("userId", "==", userId));
// Removed orderby because firebase needs compound indexes for equality + orderby
const { data: transactions, pending } = useCollection(q);

const sortedTransactions = computed(() => {
  return [...transactions.value].sort((a: any, b: any) => {
    return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
  });
});

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

const router = useRouter();
</script>

<template>
  <div class="employee-dashboard p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Моя Сводка</h1>
      <el-button
        type="primary"
        @click="router.push('/cabinet/employee/transactions/create')">
        Новая транзакция
      </el-button>
    </div>

    <!-- Stats -->
    <el-row
      :gutter="20"
      class="mb-6">
      <el-col :span="8">
        <el-card
          shadow="hover"
          class="bg-blue-50">
          <div class="text-sm text-gray-500">Баланс</div>
          <div class="text-2xl font-bold">{{ balance }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card
          shadow="hover"
          class="bg-green-50">
          <div class="text-sm text-gray-500">Доходы</div>
          <div class="text-2xl font-bold text-green-600">
            +{{ totalIncome }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card
          shadow="hover"
          class="bg-red-50">
          <div class="text-sm text-gray-500">Расходы</div>
          <div class="text-2xl font-bold text-red-600">-{{ totalExpense }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Table -->
    <el-card header="Последние транзакции">
      <el-table
        v-loading="pending"
        :data="sortedTransactions"
        style="width: 100%">
        <el-table-column
          prop="type"
          label="Тип">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'income' ? 'success' : 'danger'">
              {{ scope.row.type === "income" ? "Доход" : "Расход" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="amount"
          label="Сумма" />
        <el-table-column
          prop="expenseType"
          label="Категория" />
        <el-table-column
          prop="description"
          label="Описание" />
        <el-table-column
          prop="createdAt"
          label="Дата">
          <template #default="scope">
            {{
              scope.row.createdAt?.toDate
                ? new Date(scope.row.createdAt.toDate()).toLocaleString()
                : ""
            }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
