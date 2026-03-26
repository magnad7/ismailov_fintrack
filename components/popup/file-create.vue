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
const route = useRoute();
const ruleForm = reactive<{
  name: string;
  parent_id: null | number;
  type: string;
}>({
  name: "",
  parent_id: route.params.slug === "root" ? null : Number(route.params.slug),
  type: "folder",
});

const rules = reactive<FormRules>({
  name: [{ message: t("required"), required: true, trigger: "blur" }],
  parent_id: [{ message: t("required"), required: true, trigger: "blur" }],
  type: [{ message: t("required"), required: true, trigger: "blur" }],
});

const close = () => {
  emit("cancel");
  ruleFormRef.value?.resetFields();
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  loading.value = true;
  const { status } = await POST(`universal/file-manager`, ruleForm);
  if (status) {
    messageMeneger("Папка создана");
    emit("create");
  } else {
    messageMeneger("Ошибка при создании папки", "error");
    close();
  }

  loading.value = false;
};

onMounted(async () => {
  if (id.value) {
    const { data } = await GET<FileItem>( // temporary any cast to handle potential unknown structure then narrow down
      `universal/file-manager/${id.value}`
    );
    // Handle case where data might be wrapped in another data property
    ruleForm.name = data.name;
    ruleForm.parent_id = data.parent_id || null;
    ruleForm.type = data.type;
  }
});
</script>

<template>
  <el-dialog
    v-model="visible"
    width="500"
    align-center
    @close="close">
    <h2 class="mb-20 mt-4">Создать папку</h2>
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
            prop="name"
            label="Название">
            <el-input v-model="ruleForm.name" />
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
