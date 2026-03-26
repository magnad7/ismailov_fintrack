<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
const emit = defineEmits<{
  (e: "cancel" | "create"): void;
}>();
const visible = defineModel<boolean>("visible", {
  default: false,
  type: Boolean,
});
const id = defineModel<null | number>("id", {
  default: null,
  type: Number,
});
const loading = ref<boolean>(false);
const { t } = useI18n();
const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive<{
  title_en: string;
  title_ru: string;
  title_uz: string;
}>({
  title_en: "",
  title_ru: "",
  title_uz: "",
});

const rules = reactive<FormRules>({
  title_en: [{ message: t("required"), required: true, trigger: "blur" }],
  title_ru: [{ message: t("required"), required: true, trigger: "blur" }],
  title_uz: [{ message: t("required"), required: true, trigger: "blur" }],
});

watch(id, async (): Promise<void> => {
  if (id.value) {
    const { data } = await GET<Department>(`admin/department/${id.value}`);
    ruleForm.title_uz = data.title_uz;
    ruleForm.title_ru = data.title_ru;
    ruleForm.title_en = data.title_en;
  }
});

const close = (): void => {
  emit("cancel");
  ruleFormRef.value?.resetFields();
};

const submitForm = async (formEl: FormInstance | undefined): Promise<void> => {
  if (!formEl) return;
  await formEl.validate();
  loading.value = true;

  if (id.value) {
    const { status } = await PUT(`admin/department/${id.value}`, ruleForm);
    if (status) {
      messageMeneger("Отдел обновлен");
      loading.value = false;
      emit("create");
    }
  } else {
    const { status } = await POST(`admin/department`, ruleForm);
    if (status) {
      messageMeneger("Отдел создан");
      loading.value = false;
      emit("create");
    }
  }
  loading.value = false;
  emit("cancel");
};
</script>

<template>
  <el-dialog
    v-model="visible"
    width="500"
    align-center
    @close="close">
    <h2>Новый пользователь</h2>
    <p class="mb-20 mt-4">Создание нового пользователя в системе</p>
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-position="top"
      @keyup.enter="submitForm(ruleFormRef)">
      <el-row
        class="gap-20"
        :gutter="20">
        <el-col :span="24">
          <el-form-item
            prop="title_uz"
            label="Название UZ">
            <el-input v-model="ruleForm.title_uz" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            prop="title_ru"
            label="Название RU">
            <el-input v-model="ruleForm.title_ru" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            prop="title_en"
            label="Название EN">
            <el-input v-model="ruleForm.title_en" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-button
      class="black w-full mt-24"
      :loading="loading"
      @click="submitForm(ruleFormRef)">
      Сохранить
    </el-button>
  </el-dialog>
</template>
