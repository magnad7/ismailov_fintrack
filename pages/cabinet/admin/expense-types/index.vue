<script setup lang="ts">
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { ref } from "vue";
import { useCollection, useFirestore } from "vuefire";

const db = useFirestore();
const typesRef = collection(db, "expense_types");
const { data: expenseTypes, pending } = useCollection(typesRef);

const dialogVisible = ref(false);
const newType = ref("");

const addType = async () => {
  if (!newType.value) return;
  await addDoc(typesRef, { createdAt: serverTimestamp(), name: newType.value });
  newType.value = "";
  dialogVisible.value = false;
};

const removeType = async (id: string) => {
  await deleteDoc(doc(db, "expense_types", id));
};
</script>

<template>
  <div class="admin-expense-types p-4">
    <div class="flex justify-between mb-4">
      <h1 class="text-2xl font-bold">Типы расходов</h1>
      <el-button
        type="primary"
        @click="dialogVisible = true">
        Добавить тип
      </el-button>
    </div>

    <el-card>
      <el-table
        v-loading="pending"
        :data="expenseTypes"
        style="width: 100%">
        <el-table-column
          prop="name"
          label="Название" />
        <el-table-column
          label="Действия"
          width="120">
          <template #default="scope">
            <el-button
              type="danger"
              size="small"
              @click="removeType(scope.row.id)">
              Удалить
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="Новый тип расходов"
      width="30%">
      <el-input
        v-model="newType"
        placeholder="Название типа" />
      <template #footer>
        <el-button @click="dialogVisible = false">Отмена</el-button>
        <el-button
          type="primary"
          @click="addType">
          Сохранить
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
