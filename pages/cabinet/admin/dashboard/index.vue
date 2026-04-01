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
import { collection } from "firebase/firestore";
import { Doughnut, Line } from "vue-chartjs";
import { useCollection, useFirestore } from "vuefire";

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
const router = useRouter();

// ──── Fetch Data ────
const { data: transactions, pending } = useCollection(
  collection(db, "transactions")
);
const { data: employees } = useCollection(collection(db, "users"));
const { data: projects } = useCollection(collection(db, "projects"));

// ──── Stats ────
const totalIncome = computed(() =>
  transactions.value
    .filter((t: any) => t.type === "income")
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
);

const totalExpense = computed(() =>
  transactions.value
    .filter((t: any) => t.type === "expense")
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
);

const netProfit = computed(() => totalIncome.value - totalExpense.value);

const monthlyBalance = computed(() => {
  const now = new Date();
  return transactions.value
    .filter((t: any) => {
      const d = t.createdAt?.toDate?.();
      return (
        d &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum: number, t: any) => {
      return sum + (t.type === "income" ? t.amount || 0 : -(t.amount || 0));
    }, 0);
});

const formatAmount = (val: number) => {
  return val.toLocaleString("uz-UZ");
};

// ──── Line Chart: Income vs Expenses by Month ────
const lineChartData = computed(() => {
  const map = new Map<string, { expense: number; income: number }>();

  transactions.value.forEach((t: any) => {
    const d = t.createdAt?.toDate?.() || new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, { expense: 0, income: 0 });
    const entry = map.get(key)!;
    if (t.type === "income") {
      entry.income += t.amount || 0;
    } else {
      entry.expense += t.amount || 0;
    }
  });

  const keys = [...map.keys()].sort().slice(-6);
  const monthNames = [
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
  const labels = keys.map((k) => monthNames[+k.split("-")[1] - 1]);

  return {
    datasets: [
      {
        backgroundColor: "rgba(59, 130, 246, 0.06)",
        borderColor: "#3b82f6",
        borderWidth: 2.5,
        data: keys.map((k) => map.get(k)!.income),
        fill: true,
        label: "Income",
        pointHoverBackgroundColor: "#3b82f6",
        pointHoverRadius: 5,
        pointRadius: 0,
        tension: 0.4,
      },
      {
        backgroundColor: "rgba(244, 63, 94, 0.06)",
        borderColor: "#f43f5e",
        borderWidth: 2.5,
        data: keys.map((k) => map.get(k)!.expense),
        fill: true,
        label: "Expense",
        pointHoverBackgroundColor: "#f43f5e",
        pointHoverRadius: 5,
        pointRadius: 0,
        tension: 0.4,
      },
    ],
    labels: labels.length ? labels : ["—"],
  };
});

const lineChartOptions = {
  interaction: { intersect: false, mode: "index" as const },
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#4b5563",
        font: { family: "Montserrat, sans-serif", size: 13, weight: 500 },
        padding: 24,
        pointStyle: "circle",
        usePointStyle: true,
      },
      position: "bottom" as const,
    },
    tooltip: {
      backgroundColor: "#1f2937",
      bodyFont: { family: "Montserrat", size: 13 },
      boxPadding: 6,
      cornerRadius: 10,
      padding: 14,
      titleFont: { family: "Montserrat", size: 14, weight: 600 },
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
      grid: { color: "rgba(0, 0, 0, 0.04)", drawBorder: false },
      ticks: {
        color: "#9ca3af",
        font: { family: "Montserrat", size: 12 },
        padding: 12,
      },
    },
  },
};

// ──── Doughnut Chart: Expenses by Category ────
const doughnutChartData = computed(() => {
  const catMap = new Map<string, number>();

  transactions.value
    .filter((t: any) => t.type === "expense")
    .forEach((t: any) => {
      const cat = t.expenseType || "Boshqa";
      catMap.set(cat, (catMap.get(cat) || 0) + (t.amount || 0));
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
    labels: labels.length ? labels : ["Ma'lumot yo'q"],
  };
});

const doughnutChartOptions = {
  cutout: "68%",
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#4b5563",
        font: { family: "Montserrat, sans-serif", size: 12, weight: 500 },
        padding: 16,
        pointStyle: "circle",
        usePointStyle: true,
      },
      position: "bottom" as const,
    },
    tooltip: {
      backgroundColor: "#1f2937",
      bodyFont: { family: "Montserrat", size: 13 },
      boxPadding: 6,
      cornerRadius: 10,
      padding: 14,
      titleFont: { family: "Montserrat", size: 14, weight: 600 },
    },
  },
  responsive: true,
};

// ──── Table Helpers ────
const recentTransactions = computed(() =>
  [...transactions.value]
    .sort((a: any, b: any) => {
      const da = a.createdAt?.toDate?.() ?? 0;
      const db2 = b.createdAt?.toDate?.() ?? 0;
      return +db2 - +da;
    })
    .slice(0, 10)
);

const formatDate = (ts: any) => {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getProjectName = (pid: string) => {
  if (!pid || !projects.value) return "—";
  return projects.value.find((p: any) => p.id === pid)?.name || "—";
};

const getUserName = (uid: string) => {
  if (!uid || !employees.value) return "—";
  return employees.value.find((e: any) => e.id === uid)?.name || "—";
};
</script>

<template>
  <div class="dashboard">
    <!-- ──── Page Header ──── -->
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
        <h1 class="header-title">Dashboard</h1>
      </div>
    </div>

    <!-- ──── Stat Cards ──── -->
    <div class="stats-grid">
      <!-- Total Income -->
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

      <!-- Total Expenses -->
      <div class="stat-card">
        <div class="stat-content">
          <span class="stat-label">Total Expenses</span>
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
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
      </div>

      <!-- Net Profit -->
      <div class="stat-card">
        <div class="stat-content">
          <span class="stat-label">Net Profit</span>
          <h2 class="stat-value">{{ formatAmount(netProfit) }}</h2>
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
            <span class="change-value">+18.3%</span>
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
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
      </div>

      <!-- Monthly Balance -->
      <div class="stat-card">
        <div class="stat-content">
          <span class="stat-label">Monthly Balance</span>
          <h2 class="stat-value">{{ formatAmount(monthlyBalance) }}</h2>
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
            <span class="change-value">+5.1%</span>
            <span class="change-period">vs last month</span>
          </div>
        </div>
        <div class="stat-icon indigo">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <rect
              x="2"
              y="3"
              width="20"
              height="18"
              rx="2" />
            <path d="M8 3v3" />
            <path d="M16 3v3" />
            <path d="M2 9h20" />
          </svg>
        </div>
      </div>
    </div>

    <!-- ──── Charts Section ──── -->
    <div class="charts-grid">
      <!-- Line Chart: Income vs Expenses -->
      <div class="chart-card chart-card--line">
        <h3 class="chart-title">Income and Expenses</h3>
        <div
          v-loading="pending"
          class="chart-container">
          <Line
            v-if="!pending"
            id="income-expense-line-chart"
            :options="lineChartOptions"
            :data="lineChartData" />
        </div>
      </div>

      <!-- Doughnut Chart: Expenses by Category -->
      <div class="chart-card chart-card--doughnut">
        <h3 class="chart-title">Expenses by Category</h3>
        <div
          v-loading="pending"
          class="chart-container">
          <Doughnut
            v-if="!pending"
            id="expenses-category-doughnut-chart"
            :options="doughnutChartOptions"
            :data="doughnutChartData" />
        </div>
      </div>
    </div>

    <!-- ──── Recent Transactions Table ──── -->
    <div class="table-card">
      <div class="table-header">
        <h3 class="table-title">Latest Transactions</h3>
        <button
          class="view-all-btn"
          @click="router.push('/cabinet/admin/transactions')">
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
        :data="recentTransactions"
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
          width="160"
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
  </div>
</template>

<style lang="scss" scoped>
/* ──── Dashboard Layout ──── */
.dashboard {
  min-height: 100vh;
}

/* ──── Header ──── */
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

/* ──── Stat Cards Grid ──── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
    box-shadow 0.25s ease,
    transform 0.25s ease;

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
  margin: 0;
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
    font-weight: 400;
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

  &.pink {
    color: #ec4899;
    background: #fdf2f8;
  }

  &.green {
    color: #10b981;
    background: #ecfdf5;
  }

  &.indigo {
    color: #6366f1;
    background: #eef2ff;
  }
}

/* ──── Charts Grid ──── */
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
    letter-spacing: -0.2px;
  }

  .chart-container {
    height: 310px;
  }
}

/* ──── Transactions Table Card ──── */
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

/* ──── Table Styling ──── */
.dashboard-table {
  background: transparent;

  --el-table-border-color: transparent;

  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }

  :deep(.el-table__row) {
    transition: background 0.15s ease;

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

.cell-description {
  font-weight: 600;
  color: #1f2937;
}

.cell-category {
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

/* ──── Responsive ──── */
@media (width <= 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (width <= 768px) {
  .dashboard {
    padding: 16px 16px 60px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
