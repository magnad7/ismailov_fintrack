<script setup lang="ts">
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { collection, query, where } from "firebase/firestore";
import { Doughnut, Line } from "vue-chartjs";
import { useRouter } from "vue-router";
import { useCollection, useCurrentUser, useFirestore } from "vuefire";

import TransactionModal from "~/components/custom/TransactionModal.vue";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler
);

const db = useFirestore();
const currentUser = useCurrentUser();

const userId = computed(() => currentUser.value?.uid || "");

// Fetch only MY transactions
const txQuery = computed(() => {
  if (!userId.value) return null;
  return query(
    collection(db, "transactions"),
    where("userId", "==", userId.value)
  );
});
const { data: transactions, pending } = useCollection(txQuery);
const { data: projects } = useCollection(collection(db, "projects"));
const { data: employees } = useCollection(collection(db, "users"));

const router = useRouter();
const showTransactionModal = ref(false);

// Stats
const totalIncome = computed(() =>
  transactions.value
    .filter((t: any) => t.type === "income")
    .reduce((s: number, t: any) => s + (t.amount || 0), 0)
);
const totalExpense = computed(() =>
  transactions.value
    .filter((t: any) => t.type === "expense")
    .reduce((s: number, t: any) => s + (t.amount || 0), 0)
);
const balance = computed(() => totalIncome.value - totalExpense.value);
const formatAmount = (v: number) => v.toLocaleString("uz-UZ");

// Line Chart
const lineChartData = computed(() => {
  const map = new Map<string, { expense: number; income: number }>();
  transactions.value.forEach((t: any) => {
    const d = t.createdAt?.toDate?.() || new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, { expense: 0, income: 0 });
    const e = map.get(key)!;
    if (t.type === "income") {
      e.income += t.amount || 0;
    } else {
      e.expense += t.amount || 0;
    }
  });
  const keys = [...map.keys()].sort().slice(-6);
  const mNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const labels = keys.map((k) => mNames[+k.split("-")[1] - 1]);
  return {
    datasets: [
      {
        backgroundColor: "rgba(59,130,246,0.06)",
        borderColor: "#3b82f6",
        borderWidth: 2.5,
        data: keys.map((k) => map.get(k)!.income),
        fill: true,
        label: "Income",
        pointHoverRadius: 5,
        pointRadius: 0,
        tension: 0.4,
      },
      {
        backgroundColor: "rgba(244,63,94,0.06)",
        borderColor: "#f43f5e",
        borderWidth: 2.5,
        data: keys.map((k) => map.get(k)!.expense),
        fill: true,
        label: "Expense",
        pointHoverRadius: 5,
        pointRadius: 0,
        tension: 0.4,
      },
    ],
    labels: labels.length ? labels : ["—"],
  };
});

const lineOpts = {
  interaction: { intersect: false, mode: "index" as const },
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#4b5563",
        font: { family: "Montserrat", size: 13 },
        padding: 24,
        pointStyle: "circle",
        usePointStyle: true,
      },
      position: "bottom" as const,
    },
    tooltip: {
      backgroundColor: "#1f2937",
      bodyFont: { family: "Montserrat", size: 13 },
      cornerRadius: 10,
      padding: 14,
      titleFont: { family: "Montserrat", size: 14 },
    },
  },
  responsive: true,
  scales: {
    x: {
      border: { display: false },
      grid: { display: false },
      ticks: {
        color: "#9ca3af",
        font: { family: "Montserrat", size: 12 },
        padding: 8,
      },
    },
    y: {
      border: { display: false },
      grid: { color: "rgba(0,0,0,0.04)" },
      ticks: {
        color: "#9ca3af",
        font: { family: "Montserrat", size: 12 },
        padding: 12,
      },
    },
  },
};

// Doughnut Chart
const doughnutData = computed(() => {
  const catMap = new Map<string, number>();
  transactions.value
    .filter((t: any) => t.type === "expense")
    .forEach((t: any) => {
      const c = t.expenseType || "Other";
      catMap.set(c, (catMap.get(c) || 0) + (t.amount || 0));
    });
  const labels = [...catMap.keys()];
  const data = [...catMap.values()];
  const palette = [
    "#3b82f6",
    "#10b981",
    "#84cc16",
    "#f59e0b",
    "#f43f5e",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
  ];
  return {
    datasets: [
      {
        backgroundColor: palette.slice(0, Math.max(labels.length, 1)),
        borderWidth: 0,
        data: data.length ? data : [1],
        hoverOffset: 8,
      },
    ],
    labels: labels.length ? labels : ["No Data"],
  };
});

const doughnutOpts = {
  cutout: "68%",
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#4b5563",
        font: { family: "Montserrat", size: 12 },
        padding: 16,
        pointStyle: "circle",
        usePointStyle: true,
      },
      position: "bottom" as const,
    },
    tooltip: {
      backgroundColor: "#1f2937",
      bodyFont: { family: "Montserrat", size: 13 },
      cornerRadius: 10,
      padding: 14,
      titleFont: { family: "Montserrat", size: 14 },
    },
  },
  responsive: true,
};

// Table
const recentTx = computed(() =>
  [...transactions.value]
    .sort((a: any, b: any) => {
      const da = a.createdAt?.toDate?.() ?? 0;
      const db2 = b.createdAt?.toDate?.() ?? 0;
      return +db2 - +da;
    })
    .slice(0, 10)
);

const fmtDate = (ts: any) => {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getProjectName = (pid: string) => {
  if (!pid) return "—";
  return projects.value.find((p) => p.id === pid)?.name || "—";
};

const getUserName = (uid: string) => {
  if (!uid || !employees.value) return "—";
  return employees.value.find((e: any) => e.id === uid)?.name || "—";
};
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-left">
        <span class="header-icon-box">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <rect
              x="3"
              y="3"
              width="7"
              height="7"
              rx="1" />
            <rect
              x="14"
              y="3"
              width="7"
              height="7"
              rx="1" />
            <rect
              x="3"
              y="14"
              width="7"
              height="7"
              rx="1" />
            <rect
              x="14"
              y="14"
              width="7"
              height="7"
              rx="1" />
          </svg>
        </span>
        <h1 class="header-title">My Metrics</h1>
      </div>
      <button
        class="add-tx-btn"
        @click="showTransactionModal = true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        Add Transaction
      </button>
    </div>

    <!-- Stat Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <span class="stat-label">Personal Balance</span>
          <h2 class="stat-value">{{ formatAmount(balance) }}</h2>
          <div
            class="stat-change"
            :class="balance >= 0 ? 'positive' : 'negative'">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            <span class="change-value">Total</span>
          </div>
        </div>
        <div class="stat-icon blue">
          <svg
            width="22"
            height="22"
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
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <span class="stat-label">Total Income</span>
          <h2 class="stat-value">{{ formatAmount(totalIncome) }}</h2>
          <div class="stat-change positive">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            <span class="change-value">+12.5%</span>
            <span class="change-period">vs last month</span>
          </div>
        </div>
        <div class="stat-icon green">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <span class="stat-label">Total Expense</span>
          <h2 class="stat-value">{{ formatAmount(totalExpense) }}</h2>
          <div class="stat-change negative">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round">
              <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
              <polyline points="16 17 22 17 22 11" />
            </svg>
            <span class="change-value">-8.2%</span>
            <span class="change-period">vs last month</span>
          </div>
        </div>
        <div class="stat-icon pink">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="charts-grid">
      <div class="chart-card">
        <h3 class="chart-title">Income and Expenses</h3>
        <div
          v-loading="pending"
          class="chart-container">
          <Line
            v-if="!pending"
            id="emp-line-chart"
            :options="lineOpts"
            :data="lineChartData" />
        </div>
      </div>
      <div class="chart-card">
        <h3 class="chart-title">Expenses by Category</h3>
        <div
          v-loading="pending"
          class="chart-container">
          <Doughnut
            v-if="!pending"
            id="emp-doughnut-chart"
            :options="doughnutOpts"
            :data="doughnutData" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div class="table-header">
        <h3 class="table-title">Latest Transactions</h3>
        <button
          class="view-all-btn"
          @click="router.push('/cabinet/employee/transactions')">
          View All
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
      <el-table
        v-loading="pending"
        :data="recentTx"
        style="width: 100%"
        class="dashboard-table"
        size="large"
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
          width="150">
          <template #default="scope">
            <span class="cell-date">
              {{ formateDate(fmtDate(scope.row.createdAt)) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="Description"
          min-width="200">
          <template #default="scope">
            <span class="cell-desc">{{ scope.row.description || "—" }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Category"
          width="180">
          <template #default="scope">
            <span class="cell-cat">{{ scope.row.expenseType || "—" }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="User"
          width="150">
          <template #default="scope">
            <span class="cell-user">{{ getUserName(scope.row.userId) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Project"
          width="160">
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
              :class="scope.row.type === 'income' ? 'income' : 'expense'">
              {{ scope.row.type === "income" ? "+" : "-"
              }}{{ scope.row.amount?.toLocaleString("uz-UZ") }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="Type"
          width="150"
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

    <TransactionModal v-model="showTransactionModal" />
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  min-height: 100vh;
  padding: 8px 32px 80px;
}

.dashboard-header {
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
    width: 36px;
    height: 36px;
    color: #6366f1;
    background: #eef2ff;
    border-radius: 10px;
  }

  .header-title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.3px;
  }
}

.add-tx-btn {
  display: flex;
  gap: 8px;
  align-items: center;
  height: 44px;
  padding: 0 22px;
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border: none;
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px 24px;
  background: #fff;
  border: 1px solid #f0f1f3;
  border-radius: 16px;
  transition:
    box-shadow 0.25s,
    transform 0.25s;

  &:hover {
    box-shadow: 0 8px 25px rgb(0 0 0 / 6%);
    transform: translateY(-2px);
  }
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.stat-value {
  margin: 4px 0 8px;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.1;
  color: #111827;
  letter-spacing: -0.4px;
}

.stat-change {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;

  &.positive {
    color: #10b981;

    svg {
      color: #10b981;
    }
  }

  &.negative {
    color: #ef4444;

    svg {
      color: #ef4444;
    }
  }

  .change-value {
    font-weight: 600;
  }

  .change-period {
    margin-left: 2px;
    color: #9ca3af;
  }
}

.stat-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;

  &.blue {
    color: #3b82f6;
    background: #eff6ff;
  }

  &.green {
    color: #10b981;
    background: #ecfdf5;
  }

  &.pink {
    color: #ec4899;
    background: #fdf2f8;
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  padding: 24px;
  background: #fff;
  border: 1px solid #f0f1f3;
  border-radius: 16px;

  .chart-title {
    margin: 0 0 20px;
    font-size: 16px;
    font-weight: 700;
    color: #111827;
  }

  .chart-container {
    height: 310px;
  }
}

.table-card {
  padding: 24px;
  background: #fff;
  border: 1px solid #f0f1f3;
  border-radius: 16px;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.view-all-btn {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 7px 16px;
  font-family: Montserrat, sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #6366f1;
  cursor: pointer;
  background: #eef2ff;
  border: none;
  border-radius: 10px;
  transition: all 0.2s ease;

  &:hover {
    color: #4f46e5;
    background: #e0e7ff;
  }
}

.dashboard-table {
  background: transparent;

  --el-table-border-color: transparent;

  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }

  :deep(.el-table__row) {
    transition: background 0.15s;

    &:hover > td.el-table__cell {
      background: #fafbfc !important;
    }
  }

  :deep(th.el-table__cell) {
    border-bottom: none !important;
  }
}

.cell-date {
  font-size: 13.5px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: #6b7280;
}

.cell-desc {
  font-weight: 600;
  color: #1f2937;
}

.cell-cat {
  font-weight: 500;
  color: #6b7280;
}

.cell-amount {
  font-weight: 700;
  font-variant-numeric: tabular-nums;

  &.income {
    color: #10b981;
  }

  &.expense {
    color: #ef4444;
  }
}

.type-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  padding: 4px 14px;
  font-size: 12px;
  font-weight: 600;
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
