<script setup>
const emit = defineEmits(["cancel", "sendMessage"]);
const visible = defineModel("visible", {
  default: false,
  type: Boolean,
});
const loading = defineModel("loading", {
  default: false,
  type: Boolean,
});
const ruleFormRef = ref();
const ruleForm = reactive({
  decline_comment: "",
});

const rules = reactive({
  decline_comment: [
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
  emit("sendMessage", ruleForm.decline_comment);
  emit("cancel");
};
</script>

<template>
  <el-dialog
    v-model="visible"
    width="500"
    align-center>
    <h2>Отклонение заявления</h2>
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
            prop="decline_comment"
            label="Укажите причину отклонения заявления:">
            <el-input
              v-model="ruleForm.decline_comment"
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
      :disabled="!ruleForm.decline_comment"
      :loading="loading"
      @click="submitForm(ruleFormRef)">
      Отклонить
    </el-button>
  </el-dialog>
</template>
