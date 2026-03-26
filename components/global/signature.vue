<script setup>
const emit = defineEmits(["save", "clear"]);
const isSavedSignature = ref(false);
const options = ref({
  backgroundColor: "rgb(255, 255, 255)",
  maxWidth: 2,
  minWidth: 2,
  penColor: "rgb(0,0,0)",
});
const signatureDataUrl = ref(null);
const signature = ref();

// const resizeImageWithCanvas = (
//   base64String,
//   newWidth,
//   newHeight,
//   quality = 0.1
// ) => {
//   return new Promise((resolve) => {
//     const img = new Image();
//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       const ctx = canvas.getContext("2d");

//       canvas.width = newWidth;
//       canvas.height = newHeight;
//       ctx.imageSmoothingEnabled = true;
//       ctx.imageSmoothingQuality = "high";
//       ctx.drawImage(img, 0, 0, newWidth, newHeight);

//       const resizedBase64 = canvas.toDataURL("image/jpeg", quality);
//       resolve(resizedBase64);
//     };
//     img.src = base64String;
//   });
// };

// const saveSignature = async () => {
//   const signatureWidthBase64 = signature.value.saveSignature();
//   const resizedImage = await resizeImageWithCanvas(
//     signatureWidthBase64,
//     100,
//     70,
//     1
//   );
//   signatureDataUrl.value = resizedImage;
// };

const saveSignature = async () => {
  const signatureWidthBase64 = signature.value.saveSignature();
  isSavedSignature.value = true;
  const file = base64ToFile(signatureWidthBase64, "signature.jpg");
  emit("save", file);
};

const clearSignature = () => {
  signature.value.clearCanvas();
  signatureDataUrl.value = null;
  isSavedSignature.value = false;
  emit("clear");
};
</script>

<template>
  <div class="signature-container bg-white medium">
    <div
      class="d-flex between"
      style="margin-bottom: 14px">
      <div class="w-full">
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
        <p class="mt-0 mb-0">
          Создайте и управляйте своей цифровой подписью для подписания
          документов
        </p>
      </div>

      <div
        class="d-flex gap-12"
        style="width: max-content">
        <el-button
          class="h-36 grey"
          @click="clearSignature">
          <Svg
            name="eraser"
            class="mr-0" />
        </el-button>
        <el-button
          class="h-36 grey"
          :disabled="isSavedSignature"
          @click="saveSignature">
          <Svg
            name="check"
            class="mr-0" />
        </el-button>
      </div>
    </div>
    <div
      class="signature-pad"
      :class="{ 'signature-saved': isSavedSignature }">
      <NuxtSignaturePad
        ref="signature"
        :height="'500px'"
        :width="'820px'"
        :max-width="options.maxWidth"
        :min-width="options.minWidth"
        :options="{
          penColor: options.penColor,
          backgroundColor: options.backgroundColor,
        }" />
    </div>
  </div>
</template>

<style scoped>
.signature-container {
  max-width: 100%;
  margin: 0 auto;
  background-color: #fafafa;
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

.signature-pad.signature-saved {
  pointer-events: none;
  filter: brightness(0.8);
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
