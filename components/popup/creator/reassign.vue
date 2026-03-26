<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
const emit = defineEmits<{
  (e: "cancel" | "create"): void;
}>();
const visible = defineModel<boolean>("visible", {
  default: false,
  type: Boolean,
});
const id = defineModel<null | number | string>("id", {
  default: null,
  type: [Number, String],
});
const variebleStore = useVariebleStore();
const loading = ref<boolean>(false);
const { locale, t } = useI18n();
const creator = ref<number[]>([]);
const confirmer = ref<number[]>([]);
const ruleFormRef = ref<FormInstance>();
const userList = ref<{
  confirmer: Employee[];
  creator: Employee[];
}>({
  confirmer: [],
  creator: [],
});
const ruleForm = reactive<{
  approvers: number[];
}>({
  approvers: [],
});

const rules = reactive<FormRules>({
  approvers: [
    { message: t("required"), required: true, trigger: "blur", type: "array" },
  ],
});

watch(id, async () => {
  if (id.value) {
    const { data } = await GET<{
      confirmer: Employee[];
      creator: Employee[];
    }>(`creator/requirements/get-approvers?statement_id=${id.value}`);
    userList.value = data;
  }
});

const close = () => {
  emit("cancel");
  ruleFormRef.value?.resetFields();
};

const getRoleName = (role: string) => {
  return (variebleStore.roles as Record<string, string>)[role];
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  loading.value = true;
  const f = new FormData();
  const userList = [...creator.value, ...confirmer.value];
  f.append("statement_id", String(id.value));
  for (const key in userList) {
    f.append(`approvers[${key}]`, String(userList[key]));
  }
  const { status } = await POST(`creator/statements/send-approvers`, f);
  if (status) {
    messageMeneger("Переназначить добавлен");
  }
  formEl.resetFields();
  loading.value = false;
  emit("create");
};

onMounted(async () => {
  if (id.value) {
    const { data } = await GET<{
      confirmer: Employee[];
      creator: Employee[];
    }>(`creator/requirements/get-approvers?statement_id=${id.value}`);
    userList.value = data;
  }
});
</script>

<template>
  <el-dialog
    v-model="visible"
    width="500"
    align-center
    @close="close">
    <h2>Переназначить добавить</h2>
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
            label="">
            <h4 style="width: 100%">Подтверждающий</h4>
            <br />
            <el-checkbox-group v-model="confirmer">
              <el-checkbox
                v-for="(item, index) in userList.confirmer"
                :key="index + 'Подтверждающий'"
                :label="item.fullname"
                :value="item.id"
                class="auto-height">
                <span>{{ item.fullname }}</span>
                <h5>
                  {{ item.department[locale] }} |
                  {{ getRoleName(item.role) }}
                </h5>
              </el-checkbox>
            </el-checkbox-group>
            <h4 style="width: 100%">Создатель</h4>
            <br />
            <el-checkbox-group v-model="creator">
              <el-checkbox
                v-for="(item, index) in userList.creator"
                :key="index + 'Создатель'"
                :label="item.fullname"
                :value="item.id"
                class="auto-height">
                <span>{{ item.fullname }}</span>
                <h5>
                  {{ item.department[locale] }} |
                  {{ getRoleName(item.role) }}
                </h5>
              </el-checkbox>
            </el-checkbox-group>
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
