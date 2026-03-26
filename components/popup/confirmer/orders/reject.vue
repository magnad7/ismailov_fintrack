<script setup>
const emit = defineEmits(["cancel"]);
const authStore = useAuthStore();
const visible = defineModel("visible", {
  default: false,
  type: Boolean,
});
const id = defineModel("id", {
  default: null,
  type: Number,
});
const loading = defineModel("loading", {
  default: false,
  type: Boolean,
});
const isSignature = ref(false);
const ruleForm = reactive({
  comment: "",
  handmade_signature: null,
});

const saveSignature = (file) => {
  ruleForm.handmade_signature = file;
  isSignature.value = true;
};

const submitForm = async () => {
  const f = new FormData();
  f.append("order_id", id.value);
  f.append("handmade_signature", ruleForm.handmade_signature);
  f.append("comment", ruleForm.comment);
  await POST(`${authStore.role}/orders/decline-approval-order`, f);
  emit("cancel");
};
</script>

<template>
  <el-dialog
    v-model="visible"
    width="900"
    align-center>
    <el-input
      v-model="ruleForm.comment"
      type="textarea"
      class="mb-24"
      :autosize="{ minRows: 3, maxRows: 10 }"
      placeholder="Укажите причину отклонения документа..."
      style="width: 100% !important; background: #fff !important" />
    <Signature
      @save="saveSignature"
      @clear="isSignature = false" />

    <el-button
      class="mt-24 grey"
      :disabled="!ruleForm.comment || !isSignature"
      :loading="loading"
      @click="submitForm">
      Отклонить заявление
    </el-button>
  </el-dialog>
</template>
