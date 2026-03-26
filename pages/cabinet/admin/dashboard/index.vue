<script setup lang="ts">
import { BottomRight, TopRight, Wallet } from "@element-plus/icons-vue";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { collection } from "firebase/firestore";
import { Bar } from "vue-chartjs";
import { useCollection, useFirestore } from "vuefire";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const db = useFirestore();

// Fetch Data
const transactionsRef = collection(db, "transactions");
// Order by created at might need composite index if we filter by user, but here we fetch all for admin
const { data: transactions, pending } = useCollection(transactionsRef);

const employeesRef = collection(db, "users");
const { data: employees } = useCollection(employeesRef);
const router = useRouter();
const projectsRef = collection(db, "projects");
const { data: projects } = useCollection(projectsRef);

// Calculate Stats
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

// Chart Data (Expenses by Project)
const chartData = computed(() => {
  const projectLabels = projects.value.map((p) => p.name);
  const projectExpenses = projects.value.map((p) => {
    return transactions.value
      .filter((t: any) => t.projectId === p.id && t.type === "expense")
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  });

  return {
    datasets: [
      {
        backgroundColor: "#f56c6c",
        borderRadius: 4,
        data: projectExpenses.length > 0 ? projectExpenses : [0],
        label: "Loyihalar bo'yicha xarajatlar",
      },
    ],
    labels: projectLabels.length > 0 ? projectLabels : ["Ma'lumot yo'q"],
  };
});

const chartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: false,
    },
  },
  responsive: true,
};

const recentTransactions = computed(() => {
  return [...transactions.value]
    .sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : 0;
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : 0;
      return dateB - dateA;
    })
    .slice(0, 10);
});

const getEmployeeName = (userId: string) => {
  const emp = employees.value.find((e) => e.id === userId);
  return emp ? emp.name : "Noma'lum";
};

const getProjectName = (projectId: string) => {
  const proj = projects.value.find((p) => p.id === projectId);
  return proj ? proj.name : "Noma'lum";
};
</script>

<template>
  <div class="admin-dashboard p-6 pb-20">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          Boshqaruv Paneli (Admin)
        </h1>
        <p class="text-gray-500 text-sm mt-1">
          Umumiy moliyaviy oqim va statistikalar
        </p>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <el-row
      :gutter="20"
      class="mb-8">
      <el-col :span="8">
        <el-card
          shadow="hover"
          class="stat-card balance-card">
          <div class="stat-icon">
            <el-icon :size="24"><Wallet /></el-icon>
          </div>
          <div class="stat-content">
            <p class="stat-title">Umumiy Balans</p>
            <h2
              class="stat-value"
              :class="balance >= 0 ? 'text-green-600' : 'text-red-600'">
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
            <p class="stat-title">Jami Daromad</p>
            <h2 class="stat-value text-green-600">
              +{{ totalIncome.toLocaleString() }}
            </h2>
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
            <p class="stat-title">Jami Xarajat</p>
            <h2 class="stat-value text-red-600">
              -{{ totalExpense.toLocaleString() }}
            </h2>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts and Tables -->
    <el-row :gutter="24">
      <!-- Chart Column -->
      <el-col :span="10">
        <el-card
          shadow="never"
          class="chart-card !border-gray-100">
          <template #header>
            <div class="font-bold text-gray-700">
              Loyihalar Kesimida Xarajatlar
            </div>
          </template>
          <div class="h-80">
            <Bar
              v-if="!pending"
              id="my-chart-id"
              :options="chartOptions"
              :data="chartData" />
          </div>
        </el-card>
      </el-col>

      <!-- Table Column -->
      <el-col :span="14">
        <el-card
          shadow="never"
          class="table-card !border-gray-100">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold text-gray-700">
                So'nggi Tranzaksiyalar
              </span>
              <el-button
                link
                type="primary"
                @click="router.push('/cabinet/admin/transactions')">
                Barchasi
              </el-button>
            </div>
          </template>

          <el-table
            v-loading="pending"
            :data="recentTransactions"
            style="width: 100%"
            stripe
            size="large">
            <el-table-column label="Xodim">
              <template #default="scope">
                <span class="font-medium text-gray-800">
                  {{ getEmployeeName(scope.row.userId) }}
                </span>
              </template>
            </el-table-column>

            <el-table-column label="Loyiha">
              <template #default="scope">
                {{ getProjectName(scope.row.projectId) }}
              </template>
            </el-table-column>

            <el-table-column label="Kategoriya">
              <template #default="scope">
                <el-tag
                  size="small"
                  type="info">
                  {{ scope.row.expenseType || "None" }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column
              label="Summa"
              align="right">
              <template #default="scope">
                <span
                  :class="
                    scope.row.type === 'income'
                      ? 'text-green-600 font-bold'
                      : 'text-red-600 font-bold'
                  ">
                  {{ scope.row.type === "income" ? "+" : "-"
                  }}{{ scope.row.amount?.toLocaleString() }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
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
    width: 56px;
    height: 56px;
    margin-right: 20px;
    color: #606266;
    background-color: #f0f2f5;
    border-radius: 50%;
  }

  .stat-content {
    .stat-title {
      margin: 0 0 4px;
      font-size: 14px;
      font-weight: 600;
      color: #909399;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      margin: 0;
      font-size: 28px;
      font-weight: 800;
      line-height: 1;
    }
  }
}

.chart-card,
.table-card {
  border-radius: 16px;

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #f3f4f6;
  }
}
</style>
