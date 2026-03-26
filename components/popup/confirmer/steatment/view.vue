<script setup>
defineEmits(["cancel", "sendMessage"]);
defineProps({
  obj: {
    default: () => ({}),
    type: Object,
  },
});
const visible = defineModel("visible", {
  default: false,
  type: Boolean,
});
const { locale, t } = useI18n();
</script>

<template>
  <el-dialog
    v-model="visible"
    width="500"
    align-center>
    <h2>{{ obj.statement_title }}</h2>
    <p class="mt-4">От: {{ obj.sender_fullname }} • {{ obj.created_at }}</p>
    <h3>Тип заявления</h3>
    <p class="mt-4">{{ obj.statement_type[locale] }}</p>
    <h3>Приоритет</h3>
    <p class="mt-4">{{ t("priority." + obj.priority) }}</p>
    <h3>Причина</h3>
    <p class="mt-4">{{ obj.reason }}</p>
    <h3>Дата начала и окончания</h3>
    <p class="mt-4">{{ obj.start_date }} - {{ obj.end_date }}</p>
    <h3>Подтверждение отправителя Ф.И.О</h3>
    <p class="mt-4">{{ obj.sender_confirmation_fullname }}</p>
  </el-dialog>
</template>
