<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useCollection, useFirestore } from "vuefire";
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(["update:modelValue", "saved"]);

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const db = useFirestore();
const authStore = useAuthStore();

// Collections for selects
const expenseTypesRef = collection(db, "expense_types");
const { data: expenseTypes } = useCollection(expenseTypesRef);

const projectsRef = collection(db, "projects");
const { data: projects } = useCollection(projectsRef);

// Form
const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive({
  amount: null as null | number,
  date: new Date(),
  description: "",
  expenseType: "",
  projectId: "",
  type: "expense",
});

const rules = reactive<FormRules>({
  amount: [{ message: "Majburiy maydon", required: true, trigger: "blur" }],
  date: [{ message: "Majburiy maydon", required: true, trigger: "change" }],
  expenseType: [
    { message: "Majburiy maydon", required: true, trigger: "change" },
  ],
  projectId: [
    { message: "Majburiy maydon", required: true, trigger: "change" },
  ],
  type: [{ message: "Majburiy maydon", required: true, trigger: "change" }],
});

// Watch visibility to reset form
watch(
  () => isVisible.value,
  (newVal) => {
    if (newVal) {
      if (formRef.value) formRef.value.resetFields();
      form.date = new Date();
    }
  }
);

const onSave = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await addDoc(collection(db, "transactions"), {
          amount: Number(form.amount),
          createdAt: form.date, // User selected date
          description: form.description,
          expenseType: form.expenseType,
          projectId: form.projectId,
          systemCreatedAt: serverTimestamp(),
          type: form.type,
          userId: authStore.myId,
        });

        ElMessage.success("Tranzaksiya muvaffaqiyatli saqlandi!");
        isVisible.value = false;
        emit("saved");
      } catch (err: any) {
        ElMessage.error(
          err.message || "Tranzaksiyani saqlashda xatolik yuz berdi"
        );
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<template>
  <el-dialog
    v-model="isVisible"
    title="Tranzaksiya qo'shish"
    width="500px"
    class="transaction-modal"
    destroy-on-close>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="mt-4">
      <el-form-item
        label="Tranzaksiya turi"
        prop="type">
        <el-radio-group
          v-model="form.type"
          class="w-full">
          <el-radio-button label="income">Daromad (+)</el-radio-button>
          <el-radio-button label="expense">Xarajat (-)</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <div class="flex gap-4">
        <el-form-item
          label="Summa"
          prop="amount"
          class="w-1/2">
          <el-input-number
            v-model="form.amount"
            :min="0"
            :controls="false"
            class="w-full"
            placeholder="0.00" />
        </el-form-item>

        <el-form-item
          label="Sana"
          prop="date"
          class="w-1/2">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="Sanani tanlang"
            class="w-full"
            format="DD.MM.YYYY" />
        </el-form-item>
      </div>

      <el-form-item
        label="Kategoriya"
        prop="expenseType">
        <el-select
          v-model="form.expenseType"
          placeholder="Kategoriyani tanlang"
          class="w-full">
          <el-option
            v-for="item in expenseTypes"
            :key="item.id"
            :label="item.name"
            :value="item.name" />
        </el-select>
      </el-form-item>

      <el-form-item
        label="Loyiha"
        prop="projectId">
        <el-select
          v-model="form.projectId"
          placeholder="Loyihani tanlang"
          class="w-full">
          <el-option
            v-for="item in projects"
            :key="item.id"
            :label="item.name"
            :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item
        label="Izoh"
        prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="Qo'shimcha izoh..." />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer flex justify-end gap-2">
        <el-button @click="isVisible = false">Bekor qilish</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="onSave">
          Saqlash
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.transaction-modal {
  /* You can add specific styles here if needed to override Element Plus defaults */
  .el-radio-group {
    display: flex;

    .el-radio-button {
      flex: 1;

      :deep(.el-radio-button__inner) {
        width: 100%;
      }
    }
  }
}
</style>
