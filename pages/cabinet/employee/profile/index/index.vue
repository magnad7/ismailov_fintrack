<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";

const loading = ref<boolean>(true);
const ruleFormRef = ref<FormInstance>();
const isEdit = ref<boolean>(false);
const _photoUrl = ref<string>("");
const { locale } = useI18n();
const _signatureUrl = ref<string>("");
const config = useRuntimeConfig();
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=387&q=80";
const ruleForm = reactive<EmployeeForm>({
  address: "",
  birthday: "",
  department: {
    en: "",
    ru: "",
    uz: "",
  },
  email: "",
  given_name: "",
  handmade_signature: "",
  job_title: {
    en: "",
    ru: "",
    uz: "",
  },
  name: "",
  password: "",
  password_confirmation: "",
  patronymic: "",
  phone: "998",
  photo: "",
  role: "",
  surname: "",
});

const rules = reactive<FormRules>({
  address: [
    {
      message: "Поле обязательно к заполнению",
      required: true,
      trigger: "change",
    },
  ],
  birthday: [
    {
      message: "Поле обязательно к заполнению",
      required: true,
      trigger: "change",
    },
  ],
  email: [
    {
      message: "Поле обязательно к заполнению",
      required: true,
      trigger: "change",
    },
    { message: "Введите корректный email", trigger: "change", type: "email" },
  ],
  given_name: [
    {
      message: "Поле обязательно к заполнению",
      required: true,
      trigger: "change",
    },
  ],
  name: [
    {
      message: "Поле обязательно к заполнению",
      required: false,
      trigger: "change",
    },
  ],
  password: [
    {
      message: "Поле обязательно к заполнению",
      required: false,
      trigger: "change",
    },
  ],
  password_confirmation: [
    {
      message: "Поле обязательно к заполнению",
      required: false,
      trigger: "change",
    },
    {
      trigger: "change",
      validator: (_, value, callback) => {
        if (value !== ruleForm.password)
          callback(new Error("Пароли не совпадают"));
        else callback();
      },
    },
  ],
  patronymic: [
    {
      message: "Поле обязательно к заполнению",
      required: true,
      trigger: "change",
    },
  ],
  phone: [
    {
      message: "Поле обязательно к заполнению",
      required: true,
      trigger: "change",
    },
  ],
  role: [
    {
      message: "Поле обязательно к заполнению",
      required: true,
      trigger: "change",
    },
  ],

  surname: [
    {
      message: "Поле обязательно к заполнению",
      required: true,
      trigger: "change",
    },
  ],
});

const fetchData = async () => {
  loading.value = true;
  const { data } = await GET<EmployeeForm>(`universal/profile`);
  (Object.keys(ruleForm) as Array<keyof EmployeeForm>).forEach((key) => {
    if (key === "photo") {
      _photoUrl.value = data[key] || "";
    } else if (key === "handmade_signature") {
      _signatureUrl.value = data[key] || "";
    } else if (Object.prototype.hasOwnProperty.call(data, key)) {
      (ruleForm as any)[key] = data[key] ?? ruleForm[key];
    }
  });
  loading.value = false;
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  const f = new FormData();
  await formEl.validate(async (valid) => {
    if (valid) {
      if (ruleForm.photo) {
        f.append("photo", ruleForm.photo);
      }
      if (ruleForm.handmade_signature) {
        f.append("handmade_signature", ruleForm.handmade_signature);
      }
      f.append("name", ruleForm.name);
      f.append("given_name", ruleForm.given_name);
      f.append("surname", ruleForm.surname);
      f.append("patronymic", ruleForm.patronymic);
      f.append("email", ruleForm.email);
      f.append("phone", ruleForm.phone || "");
      f.append("address", ruleForm.address || "");
      f.append("birthday", ruleForm.birthday || "");
      f.append("role", ruleForm.role || "");
      const { status } = await POST(`universal/update-profile`, f);
      if (status) {
        messageMeneger("Профиль обновлен");
      }
    }
  });
};

onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <div class="page">
    <el-row
      :gutter="20"
      class="gap-20">
      <el-col
        :xs="24"
        :md="8">
        <div
          class="bg-white medium d-flex column"
          style="height: 100%">
          <div class="d-flex">
            <CustomUploader
              v-slot="{ previewUrl }"
              style="display: flex; justify-content: center"
              is-slot
              :accept-format="[
                'image/jpeg',
                'image/png',
                'image/jpg',
                'image/webp',
              ]"
              :max-size="5"
              icon-name=""
              @click.stop
              @update:files="(file) => (ruleForm.photo = file)">
              <div
                style="
                  width: 100px;
                  height: 100px;
                  overflow: hidden;
                  border-radius: 50%;
                ">
                <!--
        previewUrl — CustomUploader dan keladi.
        Yangi rasm yuklanganda avtomatik yangilanadi.
        Yuklanmagan bo'lsa DEFAULT_AVATAR ko'rsatiladi.
      -->
                <img
                  v-if="_photoUrl || previewUrl"
                  :src="previewUrl || config.public.baseUrl + '/' + _photoUrl"
                  alt="avatar"
                  style="width: 100%; height: 100%; object-fit: cover" />
                <img
                  v-else
                  :src="DEFAULT_AVATAR"
                  alt="avatar"
                  style="width: 100%; height: 100%; object-fit: cover" />
              </div>
            </CustomUploader>
          </div>

          <h3 class="mb-4 mt-24">Алексей Админов</h3>
          <p class="m-0">Старший разработчик</p>
          <div
            style="
              display: flex;
              flex-direction: column;
              gap: 10px;
              align-items: center;
              margin-top: 20px;
            ">
            <el-button class="grey">
              {{ ruleForm?.department?.[locale] }}
            </el-button>
            <img
              v-if="_signatureUrl"
              style="
                height: 100px;
                padding: 4px;
                object-fit: contain;
                border: 1px solid #ccc;
                border-radius: 12px;
              "
              :src="config.public.baseUrl + '/' + _signatureUrl"
              alt="" />
          </div>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="bg-white medium">
          <div class="d-flex">
            <div style="width: 100%">
              <h3 class="mb-8">Личная информация</h3>
              <p class="mb-24 mt-0">Основные данные сотрудника</p>
            </div>
            <el-button
              class="h-36 black mb-auto"
              @click="isEdit ? submitForm(ruleFormRef) : (isEdit = true)">
              <Svg :name="'edit-white'" />
              {{ isEdit ? "Сохранить" : "Редактировать" }}
            </el-button>
          </div>
          <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="rules"
            label-position="top"
            status-icon
            auto-complete="off">
            <el-row
              class="gap-20"
              :gutter="20">
              <el-col :span="8">
                <el-form-item
                  label="Имя"
                  prop="given_name">
                  <el-input
                    v-model="ruleForm.given_name"
                    :disabled="!isEdit" />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item
                  label="Фамилия"
                  prop="surname">
                  <el-input
                    v-model="ruleForm.surname"
                    :disabled="!isEdit" />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item
                  label="Отчество"
                  prop="patronymic">
                  <el-input
                    v-model="ruleForm.patronymic"
                    :disabled="!isEdit" />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item
                  label="Логин"
                  prop="name">
                  <el-input
                    v-model="ruleForm.name"
                    :disabled="!isEdit" />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item
                  label="Пароль"
                  prop="password">
                  <el-input
                    v-model="ruleForm.password"
                    type="password"
                    show-password
                    :disabled="!isEdit" />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item
                  label="Подтверждение пароля"
                  prop="password_confirmation">
                  <el-input
                    v-model="ruleForm.password_confirmation"
                    autocomplete="off"
                    type="password"
                    show-password
                    :disabled="!isEdit" />
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item
                  label="Адрес"
                  prop="address">
                  <el-input
                    v-model="ruleForm.address"
                    :disabled="!isEdit" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  label="Email"
                  prop="email">
                  <el-input
                    v-model="ruleForm.email"
                    :disabled="!isEdit" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  label="Телефон"
                  placeholder="998 90 123 45 67"
                  prop="phone">
                  <el-input
                    v-model="ruleForm.phone"
                    v-maska
                    data-maska="998 ## ### ## ##"
                    :disabled="!isEdit" />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item
                  label="Дата рождения"
                  prop="birthday">
                  <el-input
                    v-model="ruleForm.birthday"
                    v-maska
                    placeholder="YYYY-MM-DD"
                    data-maska="####-##-##"
                    :disabled="!isEdit" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
