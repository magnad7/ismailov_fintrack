<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";

import { activeL } from "#imports";

interface Approvers {
  confirmer: Employee[];
  creator: Employee[];
}
const emit = defineEmits<{
  (e: "cancel" | "create"): void;
}>();
const visible = defineModel<boolean>("visible", {
  default: false,
  type: Boolean,
});
const id = defineModel<null | number>("id", {
  default: null,
  type: Number,
});
const loading = ref<boolean>(false);
const variebleStore = useVariebleStore();
const { locale, t } = useI18n();
const confirmer = ref<number[]>([]);
const creator = ref<number[]>([]);
const ruleFormRef = ref<FormInstance>();
const userList = ref<Approvers>({ confirmer: [], creator: [] });
const orderTypeList = ref<OrderType[]>([]);
const ruleForm = reactive<{
  deadline: string;
  details: string;
  order_type_id: string;
  responsible_persons: string;
  statement_id: null | number;
  title: string;
}>({
  deadline: "",
  details: "",
  order_type_id: "",
  responsible_persons: "",
  statement_id: null,
  title: "",
});

const rules = reactive<FormRules>({
  custom_role: [
    {
      message: t("required"),
      required: true,
      trigger: "blur",
      validator: (rule: any, value: any, callback: any): void => {
        if (confirmer.value.length === 0 && creator.value.length === 0) {
          callback(new Error(t("required")));
        } else {
          callback();
        }
      },
    },
  ],
  deadline: [{ message: t("required"), required: true, trigger: "blur" }],
  details: [{ message: t("required"), required: true, trigger: "blur" }],
  order_type_id: [{ message: t("required"), required: true, trigger: "blur" }],
  responsible_persons: [
    { message: t("required"), required: true, trigger: "blur" },
  ],
  statement_id: [{ message: t("required"), required: true, trigger: "blur" }],
  title: [{ message: t("required"), required: true, trigger: "blur" }],
});

const getRoleName = (role: string) => {
  return (variebleStore.roles as Record<string, string>)[role] || role;
};

const close = () => {
  emit("cancel");
  ruleFormRef.value?.resetFields();
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate();
  loading.value = true;
  ruleForm.statement_id = id.value;

  const f = new FormData();
  const approveList = [...creator.value, ...confirmer.value];
  for (const key in approveList) {
    f.append(`approvers[]`, String(approveList[key]));
  }
  for (const key in ruleForm) {
    const k = key as keyof typeof ruleForm;
    const val = ruleForm[k];
    if (k === "deadline") {
      f.append(k, reverseFormatDate(String(val)));
    } else {
      f.append(k, val !== null ? String(val) : "");
    }
  }
  const { status } = await POST(`creator/orders/create-with-statements`, f);
  if (status) {
    messageMeneger("Заказ создан");
    loading.value = false;
    emit("create");
  }

  loading.value = false;
  emit("cancel");
};

onMounted(async () => {
  if (id.value) {
    const { data } = await GET<any>( // temporary any cast to handle potential unknown structure then narrow down
      `creator/requirements/get-approvers?statement_id=${id.value}`
    );
    // Handle case where data might be wrapped in another data property
    if (data && typeof data === "object" && "data" in data) {
      userList.value = data.data as Approvers;
    } else {
      userList.value = data as Approvers;
    }
  }
  const orderRes = await GET<OrderType[]>(`creator/requirements/order-types`);
  orderTypeList.value = orderRes.data;
});
</script>

<template>
  <el-dialog
    v-model="visible"
    width="500"
    align-center
    @close="close">
    <h2 class="mb-20 mt-4">Создать заказ на заявку APP-{{ id }}</h2>
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
            prop="order_type_id"
            label="Типы приказов">
            <el-select
              v-model="ruleForm.order_type_id"
              placeholder="Типы приказов">
              <el-option
                v-for="(item, index) in orderTypeList"
                :key="index"
                :label="activeL(item, 'title')"
                :value="item.id ?? 0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            prop="title"
            label="Название">
            <el-input v-model="ruleForm.title" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            prop="details"
            label="Подробности">
            <el-input
              v-model="ruleForm.details"
              type="textarea"
              :rows="2" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            prop="responsible_persons"
            label="Ответственные лица">
            <el-input v-model="ruleForm.responsible_persons" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            prop="deadline"
            label="Крайний срок">
            <Provider>
              <el-date-picker
                v-model="ruleForm.deadline"
                :first-day-of-week="1"
                type="date"
                format="DD.MM.YYYY"
                value-format="DD.MM.YYYY"
                placeholder="" />
            </Provider>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="Утверждающие"
            prop="custom_role">
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
