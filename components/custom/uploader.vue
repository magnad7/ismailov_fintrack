<script setup>
import { UploadFilled } from "@element-plus/icons-vue";
import { onUnmounted, ref } from "vue";

const emit = defineEmits(["update:files"]);

const props = defineProps({
  acceptFormat: {
    default: () => [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/apng",
      "image/avif",
    ],
    type: Array,
  },
  buttonColor: { default: "#000", type: String },
  class: { default: "", type: String },
  iconName: { default: "file-upload", type: String },
  isClearUploadedFiles: { default: false, type: Boolean },
  isDrag: { default: false, type: Boolean },
  isDragBlockHeight: { default: 80, type: Number },
  isMultiple: { default: false, type: Boolean },
  isSlot: { default: false, type: Boolean },
  isSlotUploadFiles: { default: false, type: Boolean },
  isView: { default: false, type: Boolean },
  isViewUploadedFiles: { default: true, type: Boolean },
  maxSize: { default: 2, type: Number },
  oldFiles: { default: () => [], type: Array },
  text: { default: "Загрузить файл", type: String },
  type: { default: "success", type: String },
});

// ─── State ────────────────────────────────────────────────────────────────────
const uploadedFiles = ref([]); // { name, type, url, isImage }
const uploadedFilesUrl = ref([]); // faqat image URL lari (preview uchun)
const allFiles = ref([]); // haqiqiy File ob'ektlari
const isDragOver = ref(false);

/**
 * Slot rejimi uchun oxirgi yuklangan faylning blob URL si.
 * Scoped slot orqali tashqariga uzatiladi:
 *
 *   <CustomUploader is-slot v-slot="{ previewUrl }">
 *     <img :src="previewUrl || defaultImg" />
 *   </CustomUploader>
 */
const previewUrl = ref(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const showMessage = (msg, type = "error", duration = 7000, html = false) => {
  if (typeof messageMeneger === "function") {
    messageMeneger(msg, type, duration, html);
  } else {
    console.warn(`[CustomUploader] ${type.toUpperCase()}: ${msg}`);
  }
};

const isFormatAllowed = (file) => {
  return props.acceptFormat.some((format) => {
    if (format.endsWith("/*")) {
      return file.type.startsWith(format.replace("/*", "/"));
    }
    return format === file.type;
  });
};

const addFile = (file) => {
  const isImage = file.type.startsWith("image/");
  const url = URL.createObjectURL(file);
  const fileData = { isImage, name: file.name, type: file.type, url };

  uploadedFiles.value.push(fileData);
  allFiles.value.push(file);

  if (isImage) {
    uploadedFilesUrl.value.push(url);
    previewUrl.value = url; // slot uchun yangilaymiz
  }
};

const revokeAll = () => {
  uploadedFiles.value.forEach((f) => URL.revokeObjectURL(f.url));
};

// ─── File input trigger ───────────────────────────────────────────────────────

const triggerFileInput = () => {
  // is-slot rejimida bir fayl bo'lsa ham qayta tanlab almashtirishga ruxsat
  const blocked =
    !props.isMultiple && uploadedFiles.value.length && !props.isSlot;
  if (blocked) return;

  const input = document.createElement("input");
  input.type = "file";
  input.multiple = props.isMultiple;
  input.accept = props.acceptFormat.join(",");
  input.style.display = "none";
  input.addEventListener("change", handleFileUpload);
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};

// ─── Event handlers ───────────────────────────────────────────────────────────

const handleFileUpload = (event) => processFiles(event.target.files);

const handleFileDrop = (event) => {
  isDragOver.value = false;
  processFiles(event.dataTransfer.files);
};

const processFiles = (files) => {
  if (!files?.length) return;

  for (const file of files) {
    if (file.size / 1024 / 1024 > props.maxSize) {
      showMessage(
        `"${file.name}" faylining hajmi maksimal ${props.maxSize}MB dan oshmasligi kerak.`,
        "error",
        7000
      );
      continue;
    }

    if (!isFormatAllowed(file)) {
      showMessage(
        `Yuklangan faylning formati xato. Kerakli formatlar:<br><br>${props.acceptFormat.join(",<br>")}`,
        "error",
        7000,
        true
      );
      continue;
    }

    // ── Bir fayl rejimi (is-slot da almashtirib yuklash) ──
    if (!props.isMultiple) {
      revokeAll();
      uploadedFiles.value = [];
      uploadedFilesUrl.value = [];
      allFiles.value = [];
      previewUrl.value = null;
      addFile(file);
      emit("update:files", file);
      return;
    }

    // ── Ko'p fayl rejimi ──
    if (props.isClearUploadedFiles) {
      emit("update:files", file);
    } else {
      addFile(file);
      emit("update:files", [...allFiles.value]);
    }
  }
};

const removeFile = (index) => {
  const removed = uploadedFiles.value[index];
  URL.revokeObjectURL(removed.url);

  uploadedFiles.value.splice(index, 1);
  allFiles.value.splice(index, 1);

  uploadedFilesUrl.value = uploadedFiles.value
    .filter((f) => f.isImage)
    .map((f) => f.url);

  // previewUrl ni oxirgi qolgan rasmga qaytaramiz
  const lastImg = [...uploadedFiles.value].reverse().find((f) => f.isImage);
  previewUrl.value = lastImg?.url ?? null;

  emit("update:files", props.isMultiple ? [...allFiles.value] : null);
};

// ─── Memory management ────────────────────────────────────────────────────────
onUnmounted(() => {
  revokeAll();
});
</script>

<template>
  <div class="custom-uploader">
    <!-- ══════════════════════════════════════════════════════
         1. SLOT rejimi  (is-slot=true)
         ─────────────────────────────────────────────────────
         Slot ichidagi har qanday elementga click qilinsa
         file input ochiladi.

         Scoped slot orqali { previewUrl } tashqariga chiqariladi.
         Tashqi komponent:
           <CustomUploader is-slot v-slot="{ previewUrl }">
             <img :src="previewUrl || '/default.png'" />
           </CustomUploader>
    ═══════════════════════════════════════════════════════ -->
    <div
      v-if="isSlot"
      class="custom-uploader-slot-wrapper"
      @click.stop="triggerFileInput"
      @dragover.prevent
      @dragenter.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleFileDrop">
      <!--
        previewUrl — yuklangan faylning blob URL si (faqat rasm bo'lsa).
        Tashqi komponent buni o'z img tegi src siga bog'laydi.
      -->
      <slot :preview-url="previewUrl" />

      <!-- Hover overlay -->
      <div class="slot-overlay">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round">
          <path
            d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle
            cx="12"
            cy="13"
            r="4" />
        </svg>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         2. Drag & Drop zonasi  (is-drag=true, is-slot=false)
    ═══════════════════════════════════════════════════════ -->
    <div
      v-else-if="isDrag"
      class="custom-uploader-drop drop-zone"
      :class="{
        'drop-zone--active': isDragOver,
        'drop-zone--disabled': !isMultiple && !!uploadedFiles.length,
      }"
      :style="`height: ${isDragBlockHeight}px;`"
      @click="triggerFileInput"
      @dragover.prevent
      @dragenter.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleFileDrop">
      <el-icon
        class="el-icon--upload mr-12"
        size="50">
        <upload-filled />
      </el-icon>
      <div class="el-upload__text">
        Drop file here or
        <em>click to upload</em>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════
         3. Oddiy tugma rejimi
    ═══════════════════════════════════════════════════════ -->
    <el-button
      v-else
      :type="type"
      :color="buttonColor"
      :disabled="!isMultiple && !!uploadedFiles.length"
      @click.prevent="triggerFileInput">
      {{ text }}
      <Svg
        v-if="iconName"
        class="ml-8 mr-0"
        :name="iconName" />
    </el-button>

    <!-- ══════════════════════════════════════════════════════
         Yuklangan fayllar ro'yxati
         (is-slot rejimida ko'rsatilmaydi)
    ═══════════════════════════════════════════════════════ -->
    <div v-if="!isSlot && (uploadedFiles.length || isViewUploadedFiles)">
      <ul>
        <template v-if="!isSlotUploadFiles && isViewUploadedFiles">
          <li
            v-for="(file, index) in uploadedFiles"
            :key="`new-${index}`"
            :class="{ 'no-view': !isView }">
            <div class="custom-uploader-image-item">
              <el-image
                v-if="file.isImage && isView"
                :src="file.url"
                :zoom-rate="1.2"
                :max-scale="7"
                :min-scale="0.2"
                :preview-src-list="uploadedFilesUrl"
                :initial-index="uploadedFilesUrl.indexOf(file.url)"
                fit="cover" />
              <img
                v-else-if="!file.isImage && isView"
                src="/images/default-file-icon.png"
                class="custom-uploader-image-item-icon"
                alt="Default file icon"
                loading="lazy" />
              <span>{{ file.name }}</span>
            </div>
            <el-button
              class="ml-auto grey mr-8"
              @click="removeFile(index)">
              <Svg
                class="mr-0"
                name="delete" />
            </el-button>
          </li>
        </template>

        <li
          v-for="(oldFile, index) in oldFiles"
          :key="`old-${index}`"
          :class="{ 'no-view': !isView }">
          <div class="custom-uploader-image-item">
            <el-image
              v-if="isView && typeof oldFile === 'string'"
              :src="oldFile"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              :preview-src-list="oldFiles.filter((f) => typeof f === 'string')"
              :initial-index="index"
              fit="cover" />
            <img
              v-else-if="isView"
              src="/images/default-file-icon.png"
              class="custom-uploader-image-item-icon"
              alt="Default file icon"
              loading="lazy" />
            <span>
              {{
                typeof oldFile === "string"
                  ? oldFile.split("/").at(-1)
                  : oldFile?.name
              }}
            </span>
          </div>
        </li>

        <slot name="extra" />
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* ── Slot wrapper ─────────────────────────────────────────── */
.custom-uploader-slot-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

/* Camera icon overlay — hover da ko'rinadi */
.slot-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  pointer-events: none; /* click ni bloklamasin */
  background: rgb(0 0 0 / 40%);
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.custom-uploader-slot-wrapper:hover .slot-overlay {
  opacity: 1;
}

/* ── Drag & Drop ──────────────────────────────────────────── */
.drop-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: #888;
  text-align: center;
  cursor: pointer;
  border: 2px dashed #ccc;
  border-radius: 6px;
  transition:
    border-color 0.3s ease,
    background-color 0.3s ease;
}

.drop-zone:hover {
  border-color: #888;
}

.drop-zone--active {
  color: #409eff;
  background-color: #ecf5ff;
  border-color: #409eff;
}

.drop-zone--disabled {
  pointer-events: none;
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
