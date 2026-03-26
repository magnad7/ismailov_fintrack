<script setup lang="ts">
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref } from "vue";
import { useCollection, useFirestore } from "vuefire";

const db = useFirestore();
const authStore = useAuthStore();
const router = useRouter();

const typesRef = collection(db, "expense_types");
const { data: expenseTypes } = useCollection(typesRef);

const form = ref({
  amount: 0,
  description: "",
  expenseType: "",
  type: "expense",
});

const loading = ref(false);

const submit = async () => {
  if (form.value.amount <= 0) {
    ElMessage.error("Сумма должна быть больше 0");
    return;
  }
  loading.value = true;
  try {
    await addDoc(collection(db, "transactions"), {
      amount: Number(form.value.amount),
      createdAt: serverTimestamp(),
      description: form.value.description,
      expenseType: form.value.expenseType || "Другое",
      type: form.value.type,
      userId: authStore.myId,
    });
    ElMessage.success("Транзакция добавлена");
    router.push("/cabinet/employee/dashboard");
  } catch (error: any) {
    ElMessage.error("Ошибка сохранения");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="employee-create-transaction p-4 max-w-lg mx-auto">
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold">Добавить транзакцию</h2>
          <el-button
            type="info"
            plain
            @click="router.back()">
            Назад
          </el-button>
        </div>
      </template>

      <el-form
        :model="form"
        label-position="top">
        <el-form-item label="Тип транзакции">
          <el-radio-group v-model="form.type">
            <el-radio-button label="expense">Расход</el-radio-button>
            <el-radio-button label="income">Доход</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="Сумма"
          required>
          <el-input-number
            v-model="form.amount"
            :min="0"
            class="w-full"
            :controls="false" />
        </el-form-item>

        <el-form-item label="Категория (Тип расхода/дохода)">
          <el-select
            v-model="form.expenseType"
            filterable
            allow-create
            default-first-option
            class="w-full"
            placeholder="Выберите или введите категория">
            <el-option
              v-for="item in expenseTypes"
              :key="item.id"
              :label="item.name"
              :value="item.name" />
          </el-select>
        </el-form-item>

        <el-form-item label="Описание">
          <el-input
            v-model="form.description"
            type="textarea"
            rows="3" />
        </el-form-item>

        <el-button
          type="primary"
          class="w-full"
          :loading="loading"
          @click="submit">
          Создать
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>
