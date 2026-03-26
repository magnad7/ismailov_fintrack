<script setup>
const emit = defineEmits(["cancel"]);
const visible = defineModel("visible", {
  type: Boolean,
});
const id = defineModel("id", {
  type: Number,
});

const submitForm = async (file) => {
  const f = new FormData();
  f.append("statement_approval_id", id.value);
  f.append("handmade_signature", file);
  await POST(`confirmer/statements/accept-confirmation-statement`, f);
  emit("cancel");
};
</script>

<template>
  <el-dialog
    v-model="visible"
    width="900"
    align-center>
    <h2>Подтверждение документа</h2>
    <p>
      Поставьте вашу подпись для утверждения документа "Заявление на отпуск"
    </p>
    <Signature @save="submitForm" />
  </el-dialog>
</template>
