<script setup lang="ts">
import { collection } from "firebase/firestore";
import { useCollection, useFirestore } from "vuefire";

const db = useFirestore();
const usersRef = collection(db, "users");
const { data: users, pending } = useCollection(usersRef);

const dialogVisible = ref(false);
const loading = ref(false);
const formParams = ref({
  email: "",
  name: "",
  password: "",
  phone: "",
  role: "employee",
});

const onAddEmployee = async () => {
  loading.value = true;
  try {
    await $fetch("/api/create-employee", {
      body: formParams.value,
      method: "POST",
    });
    dialogVisible.value = false;
    formParams.value = {
      email: "",
      name: "",
      password: "",
      phone: "",
      role: "employee",
    };
    ElMessage.success("Сотрудник успешно добавлен");
  } catch (err: any) {
    ElMessage.error(err.data?.message || "Ошибка при добавлении");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="admin-employees p-4">
    <div class="flex justify-between mb-4">
      <h1 class="text-2xl font-bold">Сотрудники</h1>
      <el-button
        type="primary"
        @click="dialogVisible = true">
        Добавить
      </el-button>
    </div>

    <el-card>
      <el-table
        v-loading="pending"
        :data="users"
        style="width: 100%">
        <el-table-column
          prop="name"
          label="Имя" />
        <el-table-column
          prop="email"
          label="Email" />
        <el-table-column
          prop="phone"
          label="Телефон" />
        <el-table-column
          prop="role"
          label="Роль">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'success'">
              {{ scope.row.role === "admin" ? "Админ" : "Сотрудник" }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="Добавление сотрудника"
      width="400px">
      <el-form
        :model="formParams"
        label-position="top">
        <el-form-item
          label="ФИО"
          required>
          <el-input v-model="formParams.name" />
        </el-form-item>
        <el-form-item
          label="Email"
          required>
          <el-input
            v-model="formParams.email"
            type="email" />
        </el-form-item>
        <el-form-item
          label="Пароль"
          required>
          <el-input
            v-model="formParams.password"
            type="password" />
        </el-form-item>
        <el-form-item label="Телефон">
          <el-input v-model="formParams.phone" />
        </el-form-item>
        <el-form-item
          label="Роль"
          required>
          <el-select
            v-model="formParams.role"
            class="w-full">
            <el-option
              label="Сотрудник"
              value="employee" />
            <el-option
              label="Администратор"
              value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Отмена</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="onAddEmployee">
          Сохранить
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
