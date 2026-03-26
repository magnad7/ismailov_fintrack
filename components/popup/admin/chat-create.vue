<script setup>
const emit = defineEmits(["cancel", "create"]);
const visible = defineModel("visible", {
  default: false,
  type: Boolean,
});
const id = defineModel("id", {
  default: null,
  type: Number,
});

const loading = ref(false);
const { t } = useI18n();
const ruleFormRef = ref();
const userList = ref([]);
const ruleForm = reactive({
  name: "",
  participant_ids: [],
});

const rules = reactive({
  name: [{ message: t("required"), required: true, trigger: "blur" }],
  participant_ids: [
    { message: t("required"), required: true, trigger: "blur", type: "array" },
  ],
});

const close = () => {
  emit("cancel");
  ruleFormRef.value?.resetFields();
};

const submitForm = async (formEl) => {
  if (!formEl) return;
  await formEl.validate();
  loading.value = true;
  const { status } = await POST(`chats`, {
    is_group: ruleForm.participant_ids.length > 1 ? true : false,
    name: ruleForm.name,
    participant_ids: ruleForm.participant_ids,
  });
  if (status) {
    messageMeneger("Чат создан");
  }
  formEl.resetFields();
  loading.value = false;
  emit("create");
};

onMounted(async () => {
  const { data } = await GET(
    `universal/requirements/users`,
    id.value
      ? {
          params: {
            chat_id: id.value,
          },
        }
      : {}
  );
  userList.value = data;
});
</script>

<template>
  <el-dialog
    v-model="visible"
    width="500"
    align-center
    @close="close">
    <h2>Создать новый чат</h2>
    <p class="mt-0 mb-16">Выберите участников для группового чата</p>
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
            prop="participant_ids"
            label="">
            <h4 style="width: 100%; line-height: 1">Выберите участников:</h4>
            <el-checkbox-group
              v-model="ruleForm.participant_ids"
              class="mt-4">
              <el-checkbox
                v-for="(item, index) in userList"
                :key="index + 'Подтверждающий'"
                :label="item.fullname"
                :value="item.id"
                class="auto-height">
                <span>{{ item.fullname }}</span>
                <h5>
                  {{ activeL(item, "department_name") }} |
                  {{ activeL(item, "job_title") }}
                </h5>
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
        <el-col
          v-if="ruleForm.participant_ids.length > 1"
          :span="24">
          <el-form-item
            prop="name"
            label="">
            <el-input
              v-model="ruleForm.name"
              placeholder="Название группы:" />
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
