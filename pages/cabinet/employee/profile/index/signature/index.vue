<script setup lang="ts">
const isWidth = ref("100%");
const isHeight = ref("400px");
const signatureLink = ref("");
const config = useRuntimeConfig();
const ruleForm = reactive<EmployeeForm>({
  address: "",
  birthday: "",
  email: "",
  given_name: "",
  handmade_signature: "",
  name: "",
  password: "",
  password_confirmation: "",
  patronymic: "",
  phone: "",
  photo: "",
  role: "",
  surname: "",
});
const options = ref({
  backgroundColor: "rgb(255, 255, 255)",
  maxWidth: 2,
  minWidth: 2,
  penColor: "rgb(0,0,0)",
});
const signatureDataUrl = ref<null | string>(null);
const signature = ref();

const fetchData = async () => {
  const { data } = await GET<EmployeeForm>(`universal/profile`);
  (Object.keys(ruleForm) as Array<keyof EmployeeForm>).forEach((key) => {
    if (key === "photo") return;
    if (key === "handmade_signature") {
      signatureLink.value = data[key] || "";
    }
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      (ruleForm as any)[key] = data[key] ?? ruleForm[key];
    }
  });
};

// base64 stringdan File obyekti yasaydigan to'g'ri funksiya
const base64ToFile = (base64String: string, filename: string): File => {
  // "data:image/png;base64,XXXX" formatini ajratamiz
  const arr = base64String.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);

  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

const saveSignature = async () => {
  // NuxtSignaturePad.saveSignature() - { isEmpty, data } yoki string qaytarishi mumkin
  const result = signature.value.saveSignature();

  // Qaysi formatda kelishini aniqlash
  let base64String: null | string = null;

  if (typeof result === "string") {
    // To'g'ridan-to'g'ri base64 string kelgan holat
    base64String = result;
  } else if (result && typeof result === "object" && result.data) {
    // { isEmpty: boolean, data: string } formatida kelgan holat
    if (result.isEmpty) {
      messageMeneger("Iltimos, avval imzo chizing!");
      return;
    }
    base64String = result.data;
  }

  if (
    !base64String ||
    base64String === "data:," ||
    !base64String.includes("base64,")
  ) {
    messageMeneger("Imzo bo'sh yoki noto'g'ri format!");
    return;
  }

  signatureDataUrl.value = base64String;

  // base64 dan to'g'ri File yasash
  const file = base64ToFile(base64String, "signature.png");

  const formData = new FormData();
  // File va filename birga uzatilmoqda - bu muhim!
  formData.append("handmade_signature", file, "signature.png");
  formData.append("name", ruleForm.name);
  formData.append("given_name", ruleForm.given_name);
  formData.append("surname", ruleForm.surname);
  formData.append("patronymic", ruleForm.patronymic);
  formData.append("email", ruleForm.email);
  formData.append("phone", ruleForm.phone || "");
  formData.append("address", ruleForm.address || "");
  formData.append("birthday", ruleForm.birthday || "");
  formData.append("role", ruleForm.role || "");

  const { status } = await POST(`universal/update-profile`, formData);
  if (status) {
    messageMeneger("Подпись обновлена");
  }
};

const clearSignature = () => {
  signature.value.clearCanvas();
  signatureDataUrl.value = null;
};

onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <div class="signature-container bg-white medium">
    <h3 class="d-flex gap-12">
      <div
        class="svg"
        style="width: 20px; height: 20px; margin-right: 8px">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-pen-tool w-5 h-5"
          aria-hidden="true">
          <path
            d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"></path>
          <path
            d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18"></path>
          <path d="m2.3 2.3 7.286 7.286"></path>
          <circle
            cx="11"
            cy="11"
            r="2"></circle>
        </svg>
      </div>
      Цифровая подпись
    </h3>
    <p class="mt-0 mb-24">
      Создайте и управляйте своей цифровой подписью для подписания документов
    </p>

    <div class="signature-pad">
      <NuxtSignaturePad
        ref="signature"
        :height="isHeight"
        :width="isWidth"
        :max-width="options.maxWidth"
        :min-width="options.minWidth"
        :options="{
          penColor: options.penColor,
          backgroundColor: options.backgroundColor,
        }" />
    </div>

    <div class="button-group">
      <el-button
        class="p-50 grey"
        @click="clearSignature">
        Очистить
      </el-button>

      <div
        v-if="signatureDataUrl || signatureLink"
        class="signature-preview">
        <img
          :src="signatureDataUrl || config.public.baseUrl + '/' + signatureLink"
          alt="Signature Preview" />
      </div>

      <el-button
        class="p-50 black"
        @click="saveSignature">
        Сохранить
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.signature-container {
  max-width: 100%;
  margin: 0 auto;
}

.signature-title {
  margin-bottom: 15px;
  font-size: 1.5rem;
  font-weight: bold;
}

.signature-pad {
  margin-bottom: 20px;
  overflow: hidden;
  border: 1px solid var(--el-menu-border-color);
  border-radius: 8px;
}

.button-group {
  display: flex;
  gap: 20px;
  justify-content: space-between;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.save-btn {
  color: white;
  background-color: #4caf50;
  border: none;
}

.save-btn:disabled {
  cursor: not-allowed;
  background-color: #aaa;
}

.clear-btn {
  color: white;
  background-color: #f44336;
  border: none;
}

button:hover {
  opacity: 0.8;
}

.signature-preview {
  margin-top: 20px;
}

.signature-preview img {
  max-width: 100%;
  border: 2px solid #ddd;
  border-radius: 8px;
}

.error-message {
  margin-top: 10px;
  font-size: 1rem;
  color: red;
}
</style>
