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

const pending = computed(
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
  <div class="employee-projects-page">
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
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </span>
        <h1 class="header-title">My Projects</h1>
      </div>
      <div class="header-description">
        <p>Personal financial reports for each assigned project.</p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!pending && projectStats.length === 0"
      class="empty-state">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9ca3af"
        stroke-width="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <p>No projects available.</p>
    </div>

    <!-- Project Cards Grid -->
    <div
      v-loading="pending"
      class="projects-grid">
      <div
        v-for="project in projectStats"
        :key="project.id"
        class="project-card">
        <div class="card-top">
          <div class="card-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2">
              <path
                d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>
        <h3 class="card-name">{{ project.name }}</h3>
        <p class="card-desc">
          {{ project.description || "No description provided." }}
        </p>

        <div class="stats-grid mt-auto">
          <div class="stat-item bg-green-50">
            <span class="stat-lbl-income">Income</span>
            <span class="stat-val-income text-green-700">
              +{{ project.personalIncome.toLocaleString("uz-UZ") }}
            </span>
          </div>

          <div class="stat-item bg-red-50">
            <span class="stat-lbl-expense">Expense</span>
            <span class="stat-val-expense text-red-700">
              -{{ project.personalExpense.toLocaleString("uz-UZ") }}
            </span>
          </div>
        </div>

        <div class="card-footer card-summary">
          <span class="card-date">Net Balance:</span>
          <span
            :class="[
              'text-lg font-extrabold',
              project.personalBalance >= 0 ? 'text-green-600' : 'text-red-600',
            ]">
            {{ project.personalBalance > 0 ? "+" : ""
            }}{{ project.personalBalance.toLocaleString("uz-UZ") }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.employee-projects-page {
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

.header-description {
  p {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
  }
}

/* ──── Empty State ──── */
.empty-state {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #9ca3af;
  text-align: center;

  p {
    margin: 0;
    font-size: 15px;
  }
}

/* ──── Projects Grid ──── */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.project-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 16px;
  box-shadow:
    0 1px 3px rgb(0 0 0 / 4%),
    0 1px 2px rgb(0 0 0 / 3%);
  transition: all 0.25s ease;

  &:hover {
    border-color: #e0e7ff;
    box-shadow:
      0 10px 15px -3px rgb(0 0 0 / 6%),
      0 4px 6px -4px rgb(0 0 0 / 4%);
    transform: translateY(-3px);
  }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: #6366f1;
    background: #eef2ff;
    border-radius: 10px;
  }

  .card-name {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 700;
    color: #111827;
  }

  .card-desc {
    flex: 1;
    min-height: 40px;
    margin: 0 0 16px;
    font-size: 13px;
    line-height: 1.5;
    color: #6b7280;
  }

  .card-footer {
    padding-top: 14px;
    border-top: 1px solid #f3f4f6;
  }

  .card-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-date {
    font-size: 12px;
    font-weight: 600;
    color: #9ca3af;
  }
}

/* Custom Employee Stats inside the card */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.bg-green-50 {
  background: #ecfdf5;
}

.bg-red-50 {
  background: #fef2f2;
}

.stat-lbl-income,
.stat-lbl-expense {
  display: block;
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-lbl-income {
  color: #059669;
}

.stat-lbl-expense {
  color: #dc2626;
}

.stat-val-income,
.stat-val-expense {
  font-size: 16px;
  font-weight: 700;
}

.text-green-700 {
  color: #047857;
}

.text-red-700 {
  color: #b91c1c;
}

.text-green-600 {
  color: #059669;
}

.text-red-600 {
  color: #dc2626;
}

.text-lg {
  font-size: 18px;
}

.font-extrabold {
  font-weight: 800;
}
</style>
