<script setup lang="ts">
import type { FormInstance } from "element-plus";

import { Check, Close } from "@element-plus/icons-vue";

const { t } = useI18n();
const loading = ref(false);
const isVisible = defineModel<boolean>("isVisible", { default: false });
const eventForm = defineModel<any>("eventForm", { required: true });
const userList = ref<{ fullname: string; id: number }[]>([]);
const eventFormRef = ref<FormInstance>();
const eventFormRules = reactive({
  color: [{ message: t("required"), required: true, trigger: "blur" }],
  date: [{ message: t("required"), required: true, trigger: "blur" }],
  endTime: [{ message: t("required"), required: true, trigger: "blur" }],
  startTime: [{ message: t("required"), required: true, trigger: "blur" }],
  title: [{ message: t("required"), required: true, trigger: "blur" }],
});
const { isEditing } = defineProps<{
  eventColors: { name: string; value: string }[];
  isEditing: boolean;
}>();

const emit = defineEmits(["save", "delete"]);
// defineEmits(["save", "delete"]);

const titleInput = ref<HTMLInputElement>();

watch(isVisible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      titleInput.value?.focus();
    });
  }
});

const submitForm = async (formEl: any) => {
  if (!formEl) return;
  await formEl.validate();
  loading.value = true;

  if (isEditing) {
    // const { status } = await PUT(
    //   `admin/department/${eventForm.value.id}`,
    //   eventForm.value
    // );
    // if (status) {
    messageMeneger("Отдел обновлен");
    loading.value = false;
    emit("save", eventForm.value);
    // }
  } else {
    // const { status } = await POST(`admin/department`, eventForm.value);
    // if (status) {
    messageMeneger("Отдел создан");
    loading.value = false;
    emit("save", eventForm.value);
    // }
  }
  loading.value = false;
  isVisible.value = false;
};

onMounted(async () => {
  const { data } = await GET<{ fullname: string; id: number }[]>(
    `requirements/users-for-calendar`
  );
  userList.value = data;
});
</script>

<template>
  <el-dialog
    v-model="isVisible"
    width="600"
    align-center
    @close="isVisible = false">
    <h2 class="mb-20">Новый событие</h2>

    <el-form
      ref="eventFormRef"
      :model="eventForm"
      :rules="eventFormRules"
      label-position="top"
      @keyup.enter="submitForm(eventFormRef)">
      <el-row
        class="gap-20"
        :gutter="20">
        <el-col :span="24">
          <el-form-item
            prop="title"
            label="Введите название">
            <el-input
              v-model="eventForm.title"
              :disabled="!eventForm.is_mine" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="Для всех ?"
            prop="is_all">
            <el-switch
              v-model="eventForm.is_all"
              :active-icon="Check"
              :disabled="!eventForm.is_mine"
              :inactive-icon="Close"
              inline-prompt
              @change="eventForm.users = []" />
          </el-form-item>
        </el-col>
        <el-col
          v-if="!eventForm.is_all"
          :span="24">
          <el-form-item
            prop="users"
            filterable
            remote
            class="h-auto"
            label="Выберите участников">
            <el-select
              v-model="eventForm.users"
              class="h-auto"
              multiple
              :disabled="!eventForm.is_mine"
              placeholder="Выберите участников">
              <el-option
                v-for="(item, index) in userList"
                :key="index"
                :label="item.fullname"
                :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            prop="startTime"
            label="Введите время начала">
            <el-time-picker
              v-model="eventForm.startTime"
              :disabled="!eventForm.is_mine"
              format="HH:mm"
              value-format="HH:mm" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            prop="endTime"
            label="Введите время окончания">
            <el-time-picker
              v-model="eventForm.endTime"
              :disabled="!eventForm.is_mine"
              format="HH:mm"
              value-format="HH:mm" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            prop="description"
            label="Введите описание">
            <el-input
              v-model="eventForm.description"
              :disabled="!eventForm.is_mine"
              type="textarea" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="🎨"
            style="display: flex; align-items: center; margin-bottom: 20px">
            <div class="color-picker ml-8">
              <el-tooltip
                v-for="color in eventColors"
                :key="color.value"
                :disabled="!eventForm.is_mine"
                :content="color.name"
                placement="top">
                <div
                  :class="[
                    'color-option',
                    { selected: eventForm.color === color.value },
                  ]"
                  :style="{ backgroundColor: color.value }"
                  @click="eventForm.color = color.value">
                  <el-icon
                    v-if="eventForm.color === color.value"
                    :disabled="!eventForm.is_mine"
                    class="check-icon">
                    <Check />
                  </el-icon>
                </div>
              </el-tooltip>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="dialog-footer">
      <button
        v-if="isEditing && eventForm.is_mine"
        class="delete-btn"
        @click="$emit('delete')">
        Удалить
      </button>
      <div class="spacer"></div>
      <button
        class="cancel-btn"
        @click="isVisible = false">
        Отмена
      </button>
      <button
        v-if="eventForm.is_mine"
        class="save-btn"
        @click="submitForm(eventFormRef)">
        Сохранить
      </button>
    </div>
  </el-dialog>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
}

.event-dialog {
  width: 448px;
  background: white;
  border-radius: 8px;
  box-shadow:
    0 24px 38px 3px rgb(0 0 0 / 14%),
    0 9px 46px 8px rgb(0 0 0 / 12%),
    0 11px 15px -7px rgb(0 0 0 / 20%);
}

.dialog-header {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 8px 8px 16px;
}

.event-title-input {
  flex: 1;
  padding: 8px 0;
  font-size: 22px;
  outline: none;
  border: none;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;
}

.event-title-input:focus {
  border-bottom-color: #1a73e8;
}

.close-btn {
  padding: 8px;
  color: #5f6368;
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 50%;
}

.close-btn:hover {
  background: #f1f3f4;
}

.dialog-body {
  padding: 16px;
}

.check-icon {
  font-size: 16px;
  font-weight: bold;
  color: white;
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 30%));
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-icon {
  width: 24px;
  font-size: 20px;
}

.form-content {
  flex: 1;
}

.date-time-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.date-input,
.time-input {
  padding: 6px 8px;
  font-size: 14px;
  border: 1px solid #dadce0;
  border-radius: 4px;
}

.description-input {
  width: 100%;
  padding: 8px;
  font-family: inherit;
  resize: vertical;
  border: 1px solid #dadce0;
  border-radius: 4px;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 50%;
  transition: transform 0.1s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #5f6368;
}

.dialog-footer {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 16px;
  border-top: 1px solid #dadce0;
}

.spacer {
  flex: 1;
}

.save-btn {
  padding: 8px 24px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  background: #1a73e8;
  border: none;
  border-radius: 4px;
}

.save-btn:hover {
  background: #1765cc;
}

.cancel-btn {
  padding: 8px 16px;
  color: #5f6368;
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 4px;
}

.cancel-btn:hover {
  background: #f8f9fa;
}

.delete-btn {
  padding: 8px 16px;
  color: #d93025;
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 4px;
}

.delete-btn:hover {
  background: #fce8e6;
}
</style>
