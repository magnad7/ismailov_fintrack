<script setup lang="ts">
import { collection, orderBy, query } from "firebase/firestore";
import { useCollection, useFirestore } from "vuefire";

const db = useFirestore();
const transactionsRef = collection(db, "transactions");
const q = query(transactionsRef, orderBy("createdAt", "desc"));
const { data: transactions, pending } = useCollection(q);
</script>

<template>
  <div class="admin-transactions p-4">
    <h1 class="text-2xl font-bold mb-4">Все транзакции</h1>
    <el-card>
      <el-table
        v-loading="pending"
        :data="transactions"
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
          prop="userId"
          label="Сотрудник" />
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
