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
  amount: [{ message: "Required field", required: true, trigger: "blur" }],
  date: [{ message: "Required field", required: true, trigger: "change" }],
  expenseType: [
    { message: "Required field", required: true, trigger: "change" },
  ],
  projectId: [{ message: "Required field", required: true, trigger: "change" }],
  type: [{ message: "Required field", required: true, trigger: "change" }],
});

// Watch visibility to reset form fully
watch(
  () => isVisible.value,
  (newVal) => {
    if (newVal) {
      Object.assign(form, {
        amount: null,
        date: new Date(),
        description: "",
        expenseType: "",
        projectId: "",
        type: "expense",
      });
      nextTick(() => {
        if (formRef.value) formRef.value.clearValidate();
      });
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
          authorId: authStore.myId,
          authorRole: "employee",
          createdAt: form.date, // User selected date
          description: form.description,
          expenseType: form.expenseType,
          projectId: form.projectId,
          systemCreatedAt: serverTimestamp(),
          type: form.type,
          userId: authStore.myId,
        });

        ElMessage.success("Transaction saved successfully!");
        isVisible.value = false;
        emit("saved");
      } catch (err: any) {
        ElMessage.error(err.message || "Error saving transaction");
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
    title="New Transaction"
    width="440px"
    class="premium-modal"
    destroy-on-close>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top">
      <el-form-item prop="type">
        <el-radio-group
          v-model="form.type"
          class="segmented-control w-full">
          <el-radio-button
            label="income"
            value="income">
            Income
          </el-radio-button>
          <el-radio-button
            label="expense"
            value="expense">
            Expense
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        label="Amount"
        prop="amount">
        <el-input-number
          v-model="form.amount"
          :min="0"
          :controls="false"
          class="w-full"
          placeholder="0.00" />
      </el-form-item>

      <el-form-item
        label="Category"
        prop="expenseType">
        <el-select
          v-model="form.expenseType"
          placeholder="Select category"
          filterable
          class="w-full">
          <el-option
            v-for="item in expenseTypes"
            :key="item.id"
            :label="item.name"
            :value="item.name" />
        </el-select>
      </el-form-item>

      <el-form-item
        label="Project"
        prop="projectId">
        <el-select
          v-model="form.projectId"
          placeholder="Select project"
          filterable
          clearable
          class="w-full">
          <el-option
            v-for="item in projects"
            :key="item.id"
            :label="item.name"
            :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item
        label="Date"
        prop="date">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="Pick a date"
          class="w-full"
          format="DD.MM.YYYY" />
      </el-form-item>

      <el-form-item
        label="Description"
        prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="Transaction description..." />
      </el-form-item>

      <button
        type="button"
        class="premium-btn mt-2"
        :class="{ 'is-loading': loading }"
        @click.prevent="onSave">
        <span v-if="loading">Saving...</span>
        <span v-else>Save Transaction</span>
      </button>
    </el-form>
  </el-dialog>
</template>
