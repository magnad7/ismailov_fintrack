<script setup lang="ts">
import { collection } from "firebase/firestore";
import { useCollection, useFirestore } from "vuefire";

import { useAuthStore } from "~/store/auth";

const db = useFirestore();
const authStore = useAuthStore();

const projectsRef = collection(db, "projects");
const { data: projects, pending: projectsPending } = useCollection(projectsRef);

const transactionsRef = collection(db, "transactions");
const { data: transactions, pending: transactionsPending } =
  useCollection(transactionsRef);

const isLoading = computed(
  () => projectsPending.value || transactionsPending.value
);

// Compute personal stats for each project
const projectStats = computed(() => {
  return (projects.value as any[]).map((project: any) => {
    const projectTransactions = (transactions.value as any[]).filter(
      (t: any) => t.projectId === project.id && t.userId === authStore.myId
    );

    const income = projectTransactions
      .filter((t: any) => t.type === "income")
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    const expense = projectTransactions
      .filter((t: any) => t.type === "expense")
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    return {
      ...project,
      personalBalance: income - expense,
      personalExpense: expense,
      personalIncome: income,
      transactionCount: projectTransactions.length,
    };
  });
});
</script>

<template>
  <div class="employee-projects p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Mening Loyihalarim</h1>
      <p class="text-gray-500 text-sm mt-1">
        Har bir loyiha bo'yicha shaxsiy moliyaviy hisobotingiz
      </p>
    </div>

    <div
      v-if="isLoading"
      class="flex justify-center p-12">
      <el-spinner />
    </div>

    <el-empty
      v-else-if="projects.length === 0"
      description="Hozircha loyihalar mavjud emas" />

    <el-row
      v-else
      :gutter="20"
      class="flex-wrap">
      <el-col
        v-for="project in projectStats"
        :key="project.id"
        :xs="24"
        :sm="12"
        :md="12"
        :lg="8"
        class="mb-4">
        <el-card
          class="project-stat-card h-full"
          shadow="hover">
          <div class="flex flex-col h-full">
            <h3 class="text-lg font-bold text-gray-800 mb-1 leading-tight">
              {{ project.name }}
            </h3>
            <p class="text-sm text-gray-500 mb-6 line-clamp-2 min-h-[40px]">
              {{ project.description || "Izoh kiritilmagan" }}
            </p>

            <div class="stats-grid mt-auto">
              <div class="stat-item bg-green-50 rounded-lg p-3">
                <span
                  class="text-xs text-green-600 font-semibold uppercase tracking-wider block mb-1">
                  Daromad
                </span>
                <span class="text-lg font-bold text-green-700">
                  +{{ project.personalIncome.toLocaleString() }}
                </span>
              </div>

              <div class="stat-item bg-red-50 rounded-lg p-3">
                <span
                  class="text-xs text-red-600 font-semibold uppercase tracking-wider block mb-1">
                  Xarajat
                </span>
                <span class="text-lg font-bold text-red-700">
                  -{{ project.personalExpense.toLocaleString() }}
                </span>
              </div>
            </div>

            <div
              class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span class="text-sm text-gray-600">Sof foyda / Balans:</span>
              <span
                :class="[
                  'text-lg font-extrabold',
                  project.personalBalance >= 0
                    ? 'text-green-600'
                    : 'text-red-600',
                ]">
                {{ project.personalBalance > 0 ? "+" : ""
                }}{{ project.personalBalance.toLocaleString() }}
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.project-stat-card {
  border: none;
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 5%),
    0 2px 4px -1px rgb(0 0 0 / 3%);
  transition: all 0.3s ease;

  &:hover {
    box-shadow:
      0 20px 25px -5px rgb(0 0 0 / 10%),
      0 10px 10px -5px rgb(0 0 0 / 4%) !important;
    transform: translateY(-4px);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
</style>
