<script setup>
const emit = defineEmits(["cancel", "sendMessage"]);
defineModel("visible", {
  default: false,
  type: Boolean,
});
defineModel("loading", {
  default: false,
  type: Boolean,
});
const ruleFormRef = ref();
const ruleForm = reactive({
  declined_message: "",
});

const rules = reactive({
  declined_message: [
    {
      message: "Поле обязательно к заполнению",
      required: true,
      trigger: "blur",
    },
  ],
});

const submitForm = async (formEl) => {
  if (!formEl) return;
  await formEl.validate();
  emit("sendMessage", ruleForm);
  emit("cancel");
};
</script>

<template>
  <el-dialog
    v-model="visible"
    width="500"
    align-center>
    <h2>Отклонение отчета</h2>
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-position="top"
      :class="ruleForm.file ? 'mb-12' : 'mb-30'"
      @keyup.enter="submitForm(ruleFormRef)">
      <el-row
        class="gap-20"
        :gutter="20">
        <el-col :span="24">
          <el-form-item
            prop="declined_message"
            label="Укажите причину отклонения отчета:">
            <el-input
              v-model="ruleForm.declined_message"
              type="textarea"
              :autosize="{ minRows: 5, maxRows: 10 }"
              placeholder="Введите причину отклонения..." />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-button
      type="danger"
      class="home-form-footer"
      :disabled="!ruleForm.declined_message"
      :loading="loading"
      @click="submitForm(ruleFormRef)">
      Отклонить отчет
    </el-button>
  </el-dialog>
</template>
