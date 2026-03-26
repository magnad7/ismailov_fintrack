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

const submitForm = async (file) => {
  const f = new FormData();
  f.append("order_id", id.value);
  f.append("handmade_signature", file);
  await POST(`${authStore.role}/orders/accept-approval-order`, f);
  emit("cancel");
};
</script>

<template>
  <el-dialog
    v-model="visible"
    width="900"
    align-center>
    <h2>Подтверждение документа</h2>
    <p>Поставьте вашу подпись для утверждения документа</p>
    <Signature @save="submitForm" />
  </el-dialog>
</template>
