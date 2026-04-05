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
      message: "Required field",
      required: true,
      trigger: "blur",
    },
    {
      message: "Enter a valid email address",
      trigger: "blur",
      type: "email",
    },
  ],
  password: [
    {
      message: "Required field",
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
      <div class="auth-body-logo">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-wallet h-5 w-5 text-primary">
          <path
            d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
          <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
        </svg>
      </div>
      <h1>FinTrack CRM</h1>
      <p>Income and Expense Management</p>

      <a
        href="https://t.me/anvarovismoil"
        target="_blank"
        class="auth-body-badge">
        <span class="badge-text">
          B2203829 Anvarov Ismoil Individual Project
        </span>
      </a>

      <div class="auth-body-form">
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
              placeholder="Email: admin@fintrack.uz" />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="ruleForm.password"
              type="password"
              show-password
              placeholder="Password" />
          </el-form-item>

          <el-form-item class="mb-0">
            <button
              class="auth-btn"
              :class="{ 'is-loading': loading }"
              :disabled="loading"
              @click.prevent="submitForm(ruleFormRef)">
              <Svg
                v-if="!loading"
                name="log-in" />
              <span>Sign In</span>
            </button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
