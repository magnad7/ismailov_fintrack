<script setup>
import { Search } from "@element-plus/icons-vue";
import { throttle } from "lodash-es";

const { $echo } = useNuxtApp();

// State-lar
const search = ref("");
const loading = ref(false);
const modal = ref(false);
const selectedChatList = ref([]);
const selectedChat = ref(null);
const messageInput = ref("");
const messageInputRef = ref(null);
const loadingFetchSelectedChat = ref(false);
const messagesContainer = ref(null);
const config = useRuntimeConfig();
const notificationStore = useNotificationStore();
const list = computed(() => notificationStore.chatList);
const activeUsers = ref([]);
const typingUser = ref(null);
const authStore = useAuthStore();
let currentChannel = null;

// Media & Emoji state
const showEmojiPicker = ref(false);
const mediaPreviewList = ref([]); // { file, url, type, uploadProgress }
const attachMenuOpen = ref(false);
const imageInput = ref(null);
const videoInput = ref(null);
const docInput = ref(null);

// ─── FILTERED LIST ────────────────────────────────────────
const filteredList = computed(() => {
  if (!search.value.trim()) return list.value;
  return list.value.filter((c) =>
    c.name?.toLowerCase().includes(search.value.toLowerCase())
  );
});

const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const leaveCurrentChannel = () => {
  if (currentChannel) {
    $echo.leave(currentChannel);
    currentChannel = null;
  }
};

const selectChat = async (chat) => {
  if (selectedChat.value?.id === chat.id) return;
  loadingFetchSelectedChat.value = true;
  leaveCurrentChannel();
  selectedChat.value = chat;
  selectedChatList.value = [];
  showEmojiPicker.value = false;
  attachMenuOpen.value = false;
  mediaPreviewList.value = [];

  try {
    const { data, status } = await GET(`chats/${chat.id}/messages`);
    if (status) {
      selectedChatList.value = data;
      connectionRoomById(chat.id);
      await scrollToBottom();
      const chatIndex = list.value.findIndex((c) => c.id === chat.id);
      if (chatIndex !== -1) list.value[chatIndex].unreadCount = 0;
    }
  } catch (err) {
    console.error("Xatolik:", err);
  } finally {
    loadingFetchSelectedChat.value = false;
  }
};

const connectionRoomById = (id) => {
  currentChannel = `chat.${id}`;
  $echo
    .join(currentChannel)
    .here((users) => {
      activeUsers.value = users;
    })
    .joining((user) => {
      if (!activeUsers.value.some((u) => u.id === user.id))
        activeUsers.value.push(user);
    })
    .leaving((user) => {
      activeUsers.value = activeUsers.value.filter((u) => u.id !== user.id);
    })
    .listen(".MessageSent", (messageText) => {
      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      selectedChatList.value.push(messageText);
      if (selectedChat.value) {
        const chatInList = list.value.find(
          (c) => c.id === selectedChat.value.id
        );
        if (chatInList) {
          chatInList.lastMessage = messageText;
          chatInList.time = time;
        }
      }
      scrollToBottom();
    })
    .listenForWhisper("typing", (e) => {
      typingUser.value = e.typing ? e.name : null;
    });
};

// ─── EMOJI ───────────────────────────────────────────────
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
  attachMenuOpen.value = false;
};

const onEmojiSelect = (emoji) => {
  messageInput.value += emoji;
  messageInputRef.value?.focus();
};

// ─── FILE / MEDIA ATTACH ──────────────────────────────────
const toggleAttachMenu = () => {
  attachMenuOpen.value = !attachMenuOpen.value;
  showEmojiPicker.value = false;
};

const openFilePicker = (type) => {
  attachMenuOpen.value = false;
  if (type === "image") imageInput.value?.click();
  else if (type === "video") videoInput.value?.click();
  else if (type === "file") docInput.value?.click();
};

const getFileType = (file) => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "file";
};

const onFilesSelected = (event) => {
  messageInputRef.value?.focus();
  const files = Array.from(event.target.files || []);
  files.forEach((file) => {
    const type = getFileType(file);
    const url = type !== "file" ? URL.createObjectURL(file) : null;
    mediaPreviewList.value.push({
      file,
      id: Date.now() + Math.random(),
      type,
      uploadProgress: 0,
      url,
    });
  });
  event.target.value = "";
};

const removePreview = (id) => {
  const item = mediaPreviewList.value.find((m) => m.id === id);
  if (item?.url) URL.revokeObjectURL(item.url);
  mediaPreviewList.value = mediaPreviewList.value.filter((m) => m.id !== id);
};

// ─── SEND MESSAGE ─────────────────────────────────────────
const sendMessage = async () => {
  showEmojiPicker.value = false;
  attachMenuOpen.value = false;
  const content = messageInput.value.trim();
  if (!content && mediaPreviewList.value.length === 0) return;
  if (!selectedChat.value) return;

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (mediaPreviewList.value.length > 0) {
    const items = [...mediaPreviewList.value];
    mediaPreviewList.value = [];
    messageInput.value = "";

    for (const item of items) {
      // 1. Placeholder qo'shamiz — uploading: true
      const placeholderId = `placeholder_${Date.now()}_${Math.random()}`;
      const placeholder = {
        _isPlaceholder: true,
        author_id: authStore.myId,
        fileName: item.file.name,
        id: placeholderId,
        message: content || "",
        previewUrl: item.url,
        time,
        type: item.type,
        uploading: true,
        uploadProgress: 0,
      };
      selectedChatList.value.push(placeholder);
      scrollToBottom();

      try {
        const formData = new FormData();
        if (content) formData.append("content", content);
        formData.append("file", item.file);

        // XMLHttpRequest bilan progress tracking
        const uploadedData = await uploadWithProgress(
          `chats/${selectedChat.value.id}/messages`,
          formData,
          (progress) => {
            const idx = selectedChatList.value.findIndex(
              (m) => m.id === placeholderId
            );
            if (idx !== -1) {
              selectedChatList.value[idx] = {
                ...selectedChatList.value[idx],
                uploadProgress: progress,
              };
            }
          }
        );

        // 2. Upload tugagach — placeholder-ni O'CHIRAMIZ
        //    (websocket event orqali haqiqiy xabar keladi,
        //     agar kelmasa ham, placeholder shart emas)
        selectedChatList.value = selectedChatList.value.filter(
          (m) => m.id !== placeholderId
        );

        // Agar websocket ishlamasa, serverdan qaytgan datani qo'shamiz
        if (uploadedData) {
          const alreadyExists = selectedChatList.value.some(
            (m) => m.id === uploadedData.id
          );
          if (!alreadyExists) {
            selectedChatList.value.push({ ...uploadedData, uploading: false });
          }
        }

        // Sidebar yangilash
        const chatInList = list.value.find(
          (c) => c.id === selectedChat.value.id
        );
        if (chatInList) {
          chatInList.lastMessage = content || `[${item.type}]`;
          chatInList.time = time;
        }

        scrollToBottom();
      } catch (err) {
        console.error("Media yuborishda xato:", err);
        // Xato bo'lsa placeholder-ni error holatiga o'tkazamiz
        const idx = selectedChatList.value.findIndex(
          (m) => m.id === placeholderId
        );
        if (idx !== -1) {
          selectedChatList.value[idx] = {
            ...selectedChatList.value[idx],
            uploadError: true,
            uploading: false,
          };
        }
      }
    }
  } else {
    // Faqat matn
    messageInput.value = "";
    scrollToBottom();
    try {
      await POST(`chats/${selectedChat.value.id}/messages`, { content });
      const chatInList = list.value.find((c) => c.id === selectedChat.value.id);
      if (chatInList) {
        chatInList.lastMessage = content;
        chatInList.time = time;
      }
      sendTypingEvent(false);
    } catch (err) {
      console.error("Yuborishda xato:", err);
    }
  }
};

// ─── UPLOAD WITH PROGRESS ────────────────────────────────
const uploadWithProgress = (url, formData, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${config.public.apiBase}${url}`);

    // Auth header — agar token kerak bo'lsa
    xhr.setRequestHeader("Authorization", `Bearer ${authStore.access}`);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          resolve(null);
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.send(formData);
  });
};

const sendTypingEvent = throttle((isTyping) => {
  if (currentChannel) {
    $echo.join(currentChannel).whisper("typing", { typing: isTyping });
  }
}, 2000);

// ─── SCROLL TO BOTTOM ─────────────────────────────────────
// Media (img/video) load bo'lganda ham scroll ishlaydi
const scrollToBottom = () => {
  return new Promise((resolve) => {
    nextTick(() => {
      const container = messagesContainer.value;
      if (!container) return resolve();

      // Barcha img va video elementlarini topamiz
      const mediaElements = container.querySelectorAll("img, video");
      if (mediaElements.length === 0) {
        container.scrollTop = container.scrollHeight;
        return resolve();
      }

      let loadedCount = 0;
      const total = mediaElements.length;

      const tryScroll = () => {
        loadedCount++;
        if (loadedCount >= total) {
          container.scrollTop = container.scrollHeight;
          resolve();
        }
      };

      mediaElements.forEach((el) => {
        if (el.complete || el.readyState >= 2) {
          tryScroll();
        } else {
          el.addEventListener("load", tryScroll, { once: true });
          el.addEventListener("error", tryScroll, { once: true });
          el.addEventListener("loadedmetadata", tryScroll, { once: true });
        }
      });

      // Fallback: 600ms dan keyin baribir scroll
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
        resolve();
      }, 300);
    });
  });
};

const fetchList = async () => {
  loading.value = true;
  modal.value = false;
  try {
    await notificationStore.getList();
  } finally {
    loading.value = false;
  }
};

// Outside click — emoji va attach menu yopish
const onOutsideClick = (e) => {
  if (!e.target.closest(".chat-popover-area")) {
    showEmojiPicker.value = false;
    attachMenuOpen.value = false;
  }
};

// Media message helpers
const isImage = (msg) =>
  msg.type === "image" ||
  (msg.file_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.file_url));
const isVideo = (msg) =>
  msg.type === "video" ||
  (msg.file_url && /\.(mp4|webm|ogg|mov)$/i.test(msg.file_url));
const isFile = (msg) =>
  msg.type === "file" || (msg.file_url && !isImage(msg) && !isVideo(msg));

const getMediaSrc = (msg) => msg.previewUrl || msg.file_url || "";

onMounted(() => {
  fetchList();
  document.addEventListener("click", onOutsideClick);
});
onUnmounted(() => {
  leaveCurrentChannel();
  document.removeEventListener("click", onOutsideClick);
});
</script>

<template>
  <div class="page">
    <h1 class="mb-20">Сообщения</h1>
    <El-row :gutter="20">
      <El-col :span="8">
        <div class="chat-sidebar bg-white">
          <div class="chat-sidebar__header">
            <h3>Чаты</h3>
            <el-button
              class="chat-sidebar__button"
              @click="modal = true">
              <Svg name="add" />
              Новый чат
            </el-button>
          </div>
          <el-input
            v-model="search"
            placeholder="Поиск..."
            class="mb-20"
            :prefix-icon="Search"
            clearable />

          <div
            v-loading="loading"
            class="chat-list">
            <div
              v-for="chat in filteredList"
              :key="chat.id"
              class="chat-item"
              :class="{ 'chat-item--active': selectedChat?.id === chat.id }"
              @click="selectChat(chat)">
              <div class="chat-item__avatar">
                <div class="chat-item__avatar-circle">
                  {{ getInitials(chat.name) }}
                </div>
                <div
                  v-if="activeUsers.some((u) => u.id === chat.userId)"
                  class="chat-item__status"></div>
              </div>
              <div class="chat-item__content">
                <div class="chat-item__row">
                  <h4 class="chat-item__name">{{ chat.name }}</h4>
                  <span
                    class="chat-item__time"
                    :title="chat.time">
                    {{ chat.time?.split(",")[0] }}
                  </span>
                </div>
                <div class="chat-item__bottom-row">
                  <p class="chat-item__message">
                    {{ chat.lastMessage?.message || chat.lastMessage }}
                  </p>
                  <span
                    v-if="chat.unreadCount > 0"
                    class="chat-item__badge">
                    {{ chat.unreadCount > 99 ? "99+" : chat.unreadCount }}
                  </span>
                </div>
              </div>
            </div>

            <div
              v-if="!loading && filteredList.length === 0"
              class="chat-list__empty">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ccc"
                stroke-width="1.5">
                <circle
                  cx="11"
                  cy="11"
                  r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span>Hech narsa topilmadi</span>
            </div>
          </div>
        </div>
      </El-col>

      <El-col :span="16">
        <div class="chat-window">
          <div
            v-if="!selectedChat"
            class="chat-window__placeholder">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ccc"
              stroke-width="1.5">
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Chatni tanlang</span>
          </div>

          <div
            v-else
            class="chat-window__container">
            <!-- Header -->
            <div class="chat-window__header">
              <div class="chat-window__info">
                <div class="chat-window__avatar-mini">
                  {{ getInitials(selectedChat.name) }}
                </div>
                <div>
                  <h3 class="chat-window__name">{{ selectedChat.name }}</h3>
                  <span class="chat-window__status-text">
                    {{
                      typingUser
                        ? `${typingUser} yozmoqda...`
                        : activeUsers.some((u) => u.id === selectedChat.userId)
                          ? "В сети"
                          : "Оффлайн"
                    }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Messages -->
            <div
              ref="messagesContainer"
              v-loading="loadingFetchSelectedChat"
              class="chat-window__messages">
              <div
                v-for="(msg, index) in selectedChatList"
                :key="msg.id || index"
                class="chat-message"
                :class="{
                  'chat-message--mine': msg.author_id == authStore.myId,
                }">
                <div
                  class="chat-message__bubble"
                  :class="{ 'chat-message__bubble--uploading': msg.uploading }">
                  <!-- IMAGE -->
                  <div
                    v-if="isImage(msg)"
                    class="chat-message__media">
                    <!-- Upload progress overlay -->
                    <div
                      v-if="msg.uploading"
                      class="chat-message__upload-overlay">
                      <div class="chat-message__progress-ring">
                        <svg
                          width="52"
                          height="52"
                          viewBox="0 0 52 52">
                          <circle
                            class="chat-message__progress-ring-bg"
                            cx="26"
                            cy="26"
                            r="22"
                            fill="none"
                            stroke-width="3" />
                          <circle
                            class="chat-message__progress-ring-fill"
                            cx="26"
                            cy="26"
                            r="22"
                            fill="none"
                            stroke-width="3"
                            :stroke-dasharray="`${2 * Math.PI * 22}`"
                            :stroke-dashoffset="`${2 * Math.PI * 22 * (1 - (msg.uploadProgress || 0) / 100)}`" />
                        </svg>
                        <span class="chat-message__progress-text">
                          {{ msg.uploadProgress || 0 }}%
                        </span>
                      </div>
                    </div>
                    <img
                      :src="getMediaSrc(msg)"
                      class="chat-message__image"
                      :class="{ 'chat-message__image--loading': msg.uploading }"
                      alt="image" />
                    <p
                      v-if="msg.message"
                      class="chat-message__text chat-message__text--caption">
                      {{ msg.message }}
                    </p>
                  </div>

                  <!-- VIDEO -->
                  <div
                    v-else-if="isVideo(msg)"
                    class="chat-message__media">
                    <div
                      v-if="msg.uploading"
                      class="chat-message__upload-overlay">
                      <div class="chat-message__progress-ring">
                        <svg
                          width="52"
                          height="52"
                          viewBox="0 0 52 52">
                          <circle
                            class="chat-message__progress-ring-bg"
                            cx="26"
                            cy="26"
                            r="22"
                            fill="none"
                            stroke-width="3" />
                          <circle
                            class="chat-message__progress-ring-fill"
                            cx="26"
                            cy="26"
                            r="22"
                            fill="none"
                            stroke-width="3"
                            :stroke-dasharray="`${2 * Math.PI * 22}`"
                            :stroke-dashoffset="`${2 * Math.PI * 22 * (1 - (msg.uploadProgress || 0) / 100)}`" />
                        </svg>
                        <span class="chat-message__progress-text">
                          {{ msg.uploadProgress || 0 }}%
                        </span>
                      </div>
                    </div>
                    <video
                      v-if="!msg.uploading"
                      :src="getMediaSrc(msg)"
                      class="chat-message__video"
                      controls
                      preload="metadata" />
                    <div
                      v-else
                      class="chat-message__video-placeholder">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(255,255,255,0.6)"
                        stroke-width="1.5">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect
                          x="1"
                          y="5"
                          width="15"
                          height="14"
                          rx="2" />
                      </svg>
                    </div>
                    <p
                      v-if="msg.message"
                      class="chat-message__text chat-message__text--caption">
                      {{ msg.message }}
                    </p>
                  </div>

                  <!-- FILE -->
                  <div
                    v-else-if="isFile(msg)"
                    class="chat-message__file">
                    <div
                      v-if="msg.uploading"
                      class="chat-message__file-uploading">
                      <div class="chat-message__file-icon">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2">
                          <path
                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div class="chat-message__file-info">
                        <span class="chat-message__file-name">
                          {{ msg.fileName || "Fayl" }}
                        </span>
                        <div class="chat-message__file-progress-bar">
                          <div
                            class="chat-message__file-progress-fill"
                            :style="{
                              width: `${msg.uploadProgress || 0}%`,
                            }"></div>
                        </div>
                        <span class="chat-message__file-progress-label">
                          {{ msg.uploadProgress || 0 }}% yuklanyapti...
                        </span>
                      </div>
                    </div>
                    <template v-else>
                      <div class="chat-message__file-icon">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2">
                          <path
                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div class="chat-message__file-info">
                        <span class="chat-message__file-name">
                          {{ msg.fileName || msg.file_name || "Fayl" }}
                        </span>
                        <span class="chat-message__file-size">
                          {{
                            msg.file_size
                              ? (msg.file_size / 1024).toFixed(1) + " KB"
                              : ""
                          }}
                        </span>
                      </div>
                      <a
                        v-if="msg.file_url"
                        :href="msg.file_url"
                        target="_blank"
                        class="chat-message__file-download">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line
                            x1="12"
                            y1="15"
                            x2="12"
                            y2="3" />
                        </svg>
                      </a>
                    </template>
                  </div>

                  <!-- TEXT ONLY -->
                  <p
                    v-else
                    class="chat-message__text">
                    {{ msg.message }}
                  </p>

                  <div
                    class="chat-message__time"
                    :title="msg.time">
                    {{ msg.time?.split(",")[0] }}
                    <span
                      v-if="msg.uploadError"
                      class="chat-message__error-icon"
                      title="Yuborilmadi">
                      ⚠️
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ─── Media Preview Strip ──────────────────── -->
            <Transition name="strip">
              <div
                v-if="mediaPreviewList.length > 0"
                class="media-preview-strip">
                <div class="media-preview-strip__inner">
                  <div
                    v-for="item in mediaPreviewList"
                    :key="item.id"
                    class="media-preview-item">
                    <button
                      class="media-preview-item__remove"
                      @click="removePreview(item.id)">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round">
                        <line
                          x1="1"
                          y1="1"
                          x2="9"
                          y2="9" />
                        <line
                          x1="9"
                          y1="1"
                          x2="1"
                          y2="9" />
                      </svg>
                    </button>

                    <div
                      v-if="item.type === 'image'"
                      class="media-preview-item__media-wrap">
                      <img
                        :src="item.url"
                        class="media-preview-item__thumb" />
                      <div class="media-preview-item__type-badge">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="currentColor">
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2" />
                          <circle
                            cx="8.5"
                            cy="8.5"
                            r="1.5" />
                          <polyline
                            points="21 15 16 10 5 21"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2" />
                        </svg>
                      </div>
                    </div>

                    <div
                      v-else-if="item.type === 'video'"
                      class="media-preview-item__media-wrap media-preview-item__media-wrap--video">
                      <video
                        :src="item.url"
                        class="media-preview-item__thumb" />
                      <div class="media-preview-item__play-icon">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="white">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                      <div
                        class="media-preview-item__type-badge media-preview-item__type-badge--video">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2">
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect
                            x="1"
                            y="5"
                            width="15"
                            height="14"
                            rx="2" />
                        </svg>
                      </div>
                    </div>

                    <div
                      v-else
                      class="media-preview-item__file">
                      <div class="media-preview-item__file-icon">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#4776e6"
                          stroke-width="2">
                          <path
                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <span class="media-preview-item__file-name">
                        {{ item.file.name }}
                      </span>
                      <span class="media-preview-item__file-size">
                        {{ (item.file.size / 1024).toFixed(0) }} KB
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- Footer -->
            <div class="chat-window__footer chat-popover-area">
              <!-- Hidden file inputs -->
              <input
                ref="imageInput"
                type="file"
                accept="image/*"
                multiple
                hidden
                @change="onFilesSelected" />
              <input
                ref="videoInput"
                type="file"
                accept="video/*"
                multiple
                hidden
                @change="onFilesSelected" />
              <input
                ref="docInput"
                type="file"
                accept="*/*"
                multiple
                hidden
                @change="onFilesSelected" />

              <!-- Attach button -->
              <div class="chat-toolbar__btn-wrap">
                <button
                  class="chat-toolbar__btn"
                  :class="{ active: attachMenuOpen }"
                  title="Fayl biriktirish"
                  @click.stop="toggleAttachMenu">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round">
                    <path
                      d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>

                <Transition name="popup">
                  <div
                    v-if="attachMenuOpen"
                    class="attach-menu"
                    @click.stop>
                    <button
                      class="attach-menu__item"
                      @click="openFilePicker('image')">
                      <span class="attach-menu__icon attach-menu__icon--image">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2">
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2" />
                          <circle
                            cx="8.5"
                            cy="8.5"
                            r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </span>
                      <span>Rasm</span>
                    </button>
                    <button
                      class="attach-menu__item"
                      @click="openFilePicker('video')">
                      <span class="attach-menu__icon attach-menu__icon--video">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2">
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect
                            x="1"
                            y="5"
                            width="15"
                            height="14"
                            rx="2" />
                        </svg>
                      </span>
                      <span>Video</span>
                    </button>
                    <button
                      class="attach-menu__item"
                      @click="openFilePicker('file')">
                      <span class="attach-menu__icon attach-menu__icon--file">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2">
                          <path
                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </span>
                      <span>Fayl</span>
                    </button>
                  </div>
                </Transition>
              </div>

              <!-- Emoji button -->
              <div class="chat-toolbar__btn-wrap">
                <button
                  class="chat-toolbar__btn"
                  :class="{ active: showEmojiPicker }"
                  title="Emoji"
                  @click.stop="toggleEmojiPicker">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round">
                    <circle
                      cx="12"
                      cy="12"
                      r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line
                      x1="9"
                      y1="9"
                      x2="9.01"
                      y2="9" />
                    <line
                      x1="15"
                      y1="9"
                      x2="15.01"
                      y2="9" />
                  </svg>
                </button>

                <Transition name="popup">
                  <div
                    v-if="showEmojiPicker"
                    class="emoji-popup"
                    @click.stop>
                    <EmojiPicker
                      @select="onEmojiSelect"
                      @close="showEmojiPicker = false" />
                  </div>
                </Transition>
              </div>

              <!-- Input -->
              <el-input
                ref="messageInputRef"
                v-model="messageInput"
                placeholder="Напишите сообщение..."
                class="chat-window__input"
                @keyup.enter="sendMessage"
                @input="sendTypingEvent(true)"
                @blur="sendTypingEvent(false)" />

              <!-- Send button -->
              <button
                class="chat-window__send-icon-btn"
                @click="sendMessage">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round">
                  <path
                    d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                  <path d="m21.854 2.147-10.94 10.939" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </El-col>
    </El-row>

    <PopupAdminChatCreate
      v-model:visible="modal"
      @create="fetchList"
      @cancel="modal = false" />
  </div>
</template>

<style lang="scss" scoped>
.page {
  &__title {
    margin-bottom: 40px;
    font-size: 24px;
    font-weight: 700;
  }
}

.chat-sidebar {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__button {
    display: flex;
    gap: 8px;
    align-items: center;
    height: 36px;
    padding: 0 16px;
    color: #fff;
    cursor: pointer;
    background-color: #000;
    border: none;
    border-radius: 8px;

    &:hover {
      opacity: 0.8;
    }
  }
}

.chat-list {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;

  &__empty {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
    padding: 32px 0;
    font-size: 13px;
    color: #bbb;
  }
}

.chat-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  background-color: #f9f9f9;
  border: 1px solid transparent;
  border-radius: 12px;
  transition:
    background-color 0.2s,
    border-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }

  &--active {
    background-color: #eee;
    border-color: #000;
  }

  &__avatar {
    position: relative;
    flex-shrink: 0;
    width: 46px;
    height: 46px;
  }

  &__avatar-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(140deg, #a5a4a4, #4f4f4f);
    border-radius: 50%;
  }

  &__status {
    position: absolute;
    right: 2px;
    bottom: 2px;
    width: 12px;
    height: 12px;
    background-color: #22c55e;
    border: 2px solid #fff;
    border-radius: 50%;
  }

  &__content {
    flex-grow: 1;
    min-width: 0;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 3px;
  }

  &__bottom-row {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: space-between;
  }

  &__name {
    margin: 0 8px 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    font-weight: 600;
    color: #000;
    white-space: nowrap;
  }

  &__time {
    flex-shrink: 0;
    font-size: 11px;
    color: #aaa;
  }

  &__message {
    flex-grow: 1;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    line-height: 1.4;
    color: #888;
    white-space: nowrap;
  }

  &__badge {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    background-color: #000;
    border-radius: 10px;
  }
}

// ─── CHAT WINDOW ──────────────────────────────────────────
.chat-window {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  overflow: hidden;
  background-color: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;

  &__placeholder {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 14px;
    color: #bbb;
  }

  &__container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  &__header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    height: 68px;
    padding: 0 20px;
    background-color: #fff;
    border-bottom: 1px solid #f0f0f0;
  }

  &__info {
    display: flex;
    flex-grow: 1;
    gap: 12px;
    align-items: center;
  }

  &__avatar-mini {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(140deg, #a5a4a4, #4f4f4f);
    border-radius: 50%;
  }

  &__name {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #000;
  }

  &__status-text {
    font-size: 12px;
    color: #888;
  }

  &__messages {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    gap: 4px;
    padding: 16px 20px;
    overflow: hidden auto;
    scroll-behavior: smooth;
    background-color: #f7f7f8;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #e0e0e0;
      border-radius: 2px;
    }
  }

  &__footer {
    position: relative;
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    padding: 10px 14px;
    background-color: #fff;
    border-top: 1px solid #f0f0f0;
  }

  &__input {
    flex: 1;
  }

  &__send-icon-btn {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    color: white;
    cursor: pointer;
    background-color: #000;
    border: none;
    border-radius: 50%;
    transition:
      opacity 0.2s,
      transform 0.15s;

    &:hover {
      opacity: 0.85;
    }

    &:active {
      transform: scale(0.93);
    }
  }
}

// ─── TOOLBAR BUTTONS ──────────────────────────────────────
.chat-toolbar__btn-wrap {
  position: relative;
}

.chat-toolbar__btn {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #888;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 50%;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    color: #333;
    background: #f0f0f0;
  }

  &.active {
    color: #000;
    background: #f0f0f0;
  }
}

// ─── ATTACH MENU ──────────────────────────────────────────
.attach-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  z-index: 100;
  min-width: 160px;
  padding: 6px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgb(0 0 0 / 12%);

  &__item {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
    padding: 9px 12px;
    font-size: 14px;
    color: #222;
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 8px;
    transition: background 0.12s;

    &:hover {
      background: #f5f5f5;
    }
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: #fff;
    border-radius: 50%;

    &--image {
      background: linear-gradient(135deg, #43c6ac, #191654);
    }

    &--video {
      background: linear-gradient(135deg, #f093fb, #f5576c);
    }

    &--file {
      background: linear-gradient(135deg, #4776e6, #8e54e9);
    }
  }
}

// ─── EMOJI POPUP ──────────────────────────────────────────
.emoji-popup {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 40px;
  z-index: 100;
}

// ─── POPUP TRANSITION ─────────────────────────────────────
.popup-enter-active,
.popup-leave-active {
  transition:
    opacity 0.15s,
    transform 0.15s;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.97);
}

// ─── MEDIA PREVIEW STRIP (yangilangan) ────────────────────
.strip-enter-active,
.strip-leave-active {
  transition:
    max-height 0.25s ease,
    opacity 0.2s;
}

.strip-enter-from,
.strip-leave-to {
  max-height: 0;
  opacity: 0;
}

.strip-enter-to,
.strip-leave-from {
  max-height: 160px;
  opacity: 1;
}

.media-preview-strip {
  flex-shrink: 0;
  overflow: hidden;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;

  &__inner {
    display: flex;
    gap: 10px;
    padding: 12px 14px;
    overflow: auto hidden;

    &::-webkit-scrollbar {
      height: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #e0e0e0;
      border-radius: 2px;
    }
  }
}

.media-preview-item {
  position: relative;
  flex-shrink: 0;

  &__remove {
    position: absolute;
    top: -5px;
    right: -5px;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    color: #fff;
    cursor: pointer;
    background: #333;
    border: 1.5px solid #fff;
    border-radius: 50%;
    transition:
      background 0.15s,
      transform 0.1s;

    &:hover {
      background: #e00;
      transform: scale(1.1);
    }
  }

  &__media-wrap {
    position: relative;
    width: 80px;
    height: 80px;
    overflow: hidden;
    background: #eee;
    border: 1.5px solid #e8e8e8;
    border-radius: 10px;

    &--video {
      background: #222;
    }
  }

  &__thumb {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__play-icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 35%);
  }

  &__type-badge {
    position: absolute;
    right: 4px;
    bottom: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    color: #fff;
    background: rgb(0 0 0 / 55%);
    border-radius: 4px;

    &--video {
      background: rgb(240 80 120 / 80%);
    }
  }

  &__file {
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 80px;
    padding: 8px;
    background: #fff;
    border: 1.5px solid #e8e8e8;
    border-radius: 10px;
  }

  &__file-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #eef2ff;
    border-radius: 8px;
  }

  &__file-name {
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 10px;
    color: #555;
    text-align: center;
    white-space: nowrap;
  }

  &__file-size {
    font-size: 10px;
    color: #aaa;
  }
}

// ─── MESSAGES ─────────────────────────────────────────────
.chat-message {
  display: flex;
  width: 100%;

  &:first-child {
    margin-top: auto;
  }

  &--mine {
    justify-content: flex-end;

    .chat-message__bubble {
      color: #fff;
      background-color: #000;
      border-bottom-right-radius: 4px;
    }

    .chat-message__time {
      color: rgb(255 255 255 / 55%);
    }

    .chat-message__file {
      color: #fff;
      border-color: rgb(255 255 255 / 20%);
    }

    .chat-message__file-name {
      color: #fff;
    }

    .chat-message__file-size {
      color: rgb(255 255 255 / 55%);
    }

    .chat-message__file-download {
      color: rgb(255 255 255 / 80%);
    }

    .chat-message__file-progress-fill {
      background: rgb(255 255 255 / 80%);
    }

    .chat-message__file-progress-bar {
      background: rgb(255 255 255 / 20%);
    }
  }

  &:not(.chat-message--mine) {
    justify-content: flex-start;

    .chat-message__bubble {
      color: #000;
      background-color: #fff;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgb(0 0 0 / 7%);
    }

    .chat-message__time {
      color: #bbb;
    }
  }

  &__bubble {
    position: relative;
    max-width: 70%;
    padding: 8px;
    font-size: 14px;
    line-height: 1.5;
    border-radius: 16px;
    transition: opacity 0.2s;

    &--uploading {
      opacity: 0.75;
    }
  }

  &__text {
    padding: 0 6px;
    margin: 0;
    overflow-wrap: break-word;
    white-space: pre-wrap;

    &--caption {
      margin-top: 6px;
      font-size: 13px;
    }
  }

  &__time {
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: flex-end;
    padding: 0 6px;
    margin-top: 4px;
    font-size: 10px;
  }

  &__error-icon {
    font-size: 12px;
  }

  &__media {
    position: relative;
    min-width: 160px;
    max-width: 300px;
  }

  // ─── Progress Ring (image/video upload) ───
  &__upload-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 40%);
    border-radius: 10px;
  }

  &__progress-ring {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__progress-ring-bg {
    stroke: rgb(255 255 255 / 25%);
  }

  &__progress-ring-fill {
    stroke: #fff;
    stroke-linecap: round;
    transform: rotate(-90deg);
    transform-origin: 26px 26px;
    transition: stroke-dashoffset 0.3s ease;
  }

  &__progress-text {
    position: absolute;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
  }

  &__image {
    display: block;
    width: 100%;
    max-width: 300px;
    object-fit: cover;
    border-radius: 10px;

    &--loading {
      filter: blur(3px);
    }
  }

  &__video {
    display: block;
    width: 100%;
    max-width: 300px;
    border-radius: 10px;
  }

  &__video-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 200px;
    height: 120px;
    background: #333;
    border-radius: 10px;
  }

  &__file {
    display: flex;
    gap: 10px;
    align-items: center;
    min-width: 180px;
    padding: 4px 0;
  }

  &__file-uploading {
    display: flex;
    gap: 10px;
    align-items: center;
    min-width: 200px;
  }

  &__file-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgb(0 0 0 / 8%);
    border-radius: 8px;
  }

  &__file-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__file-name {
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
  }

  &__file-size {
    font-size: 11px;
    opacity: 0.6;
  }

  // File upload progress bar
  &__file-progress-bar {
    height: 3px;
    margin-top: 4px;
    overflow: hidden;
    background: rgb(0 0 0 / 12%);
    border-radius: 2px;
  }

  &__file-progress-fill {
    height: 100%;
    background: rgb(0 0 0 / 50%);
    border-radius: 2px;
    transition: width 0.2s ease;
  }

  &__file-progress-label {
    margin-top: 1px;
    font-size: 10px;
    opacity: 0.6;
  }

  &__file-download {
    flex-shrink: 0;
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }
}

// ─── EL-INPUT CUSTOM ──────────────────────────────────────
:deep(.chat-window__input) {
  .el-input__wrapper {
    background-color: #f9f9f9;
    border-radius: 20px;
    box-shadow: none;

    &:hover,
    &.is-focus {
      box-shadow: 0 0 0 1px #e0e0e0 inset;
    }
  }

  .el-input__inner {
    height: 40px;
  }
}
</style>
