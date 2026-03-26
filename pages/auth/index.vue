<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
const variebleStore = useVariebleStore();
const authStore = useAuthStore();
definePageMeta({
  layout: "auth",
});

const ruleFormRef = ref<FormInstance>();
const loading = ref(false);
const ruleForm = reactive({
  email: "",
  password: "",
});

const rules = reactive<FormRules>({
  email: [
    {
      message: "Поле обязательно к заполнению",
      required: true,
      trigger: "blur",
    },
    {
      message: "Введите правильный email адрес",
      trigger: "blur",
      type: "email",
    },
  ],
  password: [
    {
      message: "Поле обязательно к заполнению",
      required: true,
      trigger: "blur",
    },
    // { min: 6, max: 10, message: "Length should be 6 to 10", trigger: "blur" },
  ],
});

const submitForm = async (formEl: any) => {
  if (!formEl) return;
  loading.value = true;
  try {
    await formEl.validate();
    const { role, status } = await authStore.signIn(ruleForm);
    if (status && role && authStore.access.length > 0) {
      const path =
        (variebleStore.list as any)[role] &&
        (variebleStore.list as any)[role][0]?.path;
      if (path) navigateTo(path);
    }
  } catch (_e) {
    // errors are shown via myErorHandler inside HTTP helpers
    console.log(_e);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth">
    <div class="auth-body">
      <Svg
        name="auth"
        class="auth-body-logo" />
      <h1>FinTrack CRM</h1>
      <p>Управление доходами и расходами</p>
      <div class="auth-body-form">
        <h2>Вход</h2>
        <el-form
          ref="ruleFormRef"
          :model="ruleForm"
          :rules="rules"
          class="demo-ruleForm"
          status-icon
          @keyup.enter="submitForm(ruleFormRef)">
          <el-form-item prop="email">
            <el-input
              v-model="ruleForm.email"
              placeholder="Email" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="ruleForm.password"
              type="password"
              show-password
              placeholder="Пароль" />
          </el-form-item>
          <el-form-item class="mb-0">
            <el-button
              class="h-36 w-full black"
              :loading="loading"
              @click="submitForm(ruleFormRef)">
              <Svg name="log-in" />
              Войти
            </el-button>
          </el-form-item>
          <!-- <CustomInputCurrency /> -->
        </el-form>
      </div>
    </div>
  </div>
</template>
