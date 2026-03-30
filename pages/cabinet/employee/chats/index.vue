<script setup lang="ts">
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { useCollection, useCurrentUser, useFirestore } from "vuefire";

const db = useFirestore();
const currentUser = useCurrentUser();

// State
const messageInput = ref("");
const messages = ref<any[]>([]);
const messagesContainer = ref<HTMLElement | null>(null);
const loadingMessages = ref(true);
let unsubMessages: (() => void) | null = null;

// Fetch all users to find admin
const { data: allUsers } = useCollection(collection(db, "users"));

const myProfile = computed(
  () => allUsers.value.find((u: any) => u.id === currentUser.value?.uid) || null
);

const adminUser = computed(
  () => allUsers.value.find((u: any) => u.role === "admin") || null
);

// Chat ID = sorted UIDs
const chatId = computed(() => {
  if (!currentUser.value?.uid || !adminUser.value?.id) return "";
  return [currentUser.value.uid, adminUser.value.id].sort().join("_");
});

// Helpers
const getInitials = (name: string) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getGradient = () => "linear-gradient(135deg, #667eea, #764ba2)";

// Listen to messages
const startListening = () => {
  if (!chatId.value) return;
  if (unsubMessages) unsubMessages();

  const q = query(
    collection(db, "chats", chatId.value, "messages"),
    orderBy("createdAt", "asc")
  );

  unsubMessages = onSnapshot(q, (snap) => {
    messages.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    loadingMessages.value = false;
    scrollToBottom();
  });
};

watch(
  chatId,
  (val) => {
    if (val) startListening();
  },
  { immediate: true }
);

// Send message
const sendMessage = async () => {
  const text = messageInput.value.trim();
  if (!text || !currentUser.value || !adminUser.value || !chatId.value) return;
  messageInput.value = "";

  const senderName = myProfile.value?.name || "Xodim";

  try {
    await setDoc(
      doc(db, "chats", chatId.value),
      {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        lastSenderId: currentUser.value.uid,
        participants: [currentUser.value.uid, adminUser.value.id].sort(),
      },
      { merge: true }
    );

    await addDoc(collection(db, "chats", chatId.value, "messages"), {
      createdAt: serverTimestamp(),
      senderId: currentUser.value.uid,
      senderName,
      text,
    });

    scrollToBottom();
  } catch (err) {
    console.error("Xabar yuborishda xatolik:", err);
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    setTimeout(() => {
      if (messagesContainer.value)
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
    }, 60);
  });
};

const formatTime = (ts: any) => {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getDateLabel = (ts: any) => {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Bugun";
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Kecha";
  return d.toLocaleDateString("uz-UZ", { day: "numeric", month: "long" });
};

const showDateSep = (i: number) => {
  if (i === 0) return true;
  const c = messages.value[i].createdAt;
  const p = messages.value[i - 1].createdAt;
  if (!c || !p) return false;
  const cd = (c.toDate ? c.toDate() : new Date(c)).toDateString();
  const pd = (p.toDate ? p.toDate() : new Date(p)).toDateString();
  return cd !== pd;
};

onUnmounted(() => {
  if (unsubMessages) unsubMessages();
});
</script>

<template>
  <div class="chat-page">
    <main class="chat-main">
      <!-- Header -->
      <div class="chat-head">
        <div
          class="chat-head__avatar"
          :style="{ background: getGradient() }">
          {{ getInitials(adminUser?.name || "Admin") }}
        </div>
        <div class="chat-head__info">
          <h3 class="chat-head__name">{{ adminUser?.name || "Admin" }}</h3>
          <span class="chat-head__sub">Admin bilan bog'lanish</span>
        </div>
      </div>

      <!-- Messages -->
      <div
        ref="messagesContainer"
        v-loading="loadingMessages"
        class="chat-messages">
        <template
          v-for="(msg, i) in messages"
          :key="msg.id">
          <div
            v-if="showDateSep(i)"
            class="date-sep">
            <span>{{ getDateLabel(msg.createdAt) }}</span>
          </div>
          <div
            class="msg"
            :class="{ 'msg--mine': msg.senderId === currentUser?.uid }">
            <div class="msg__bubble">
              <p class="msg__text">{{ msg.text }}</p>
              <span class="msg__time">{{ formatTime(msg.createdAt) }}</span>
            </div>
          </div>
        </template>

        <div
          v-if="!loadingMessages && messages.length === 0"
          class="chat-messages__empty">
          <div class="empty-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c7c7cc"
              stroke-width="1.2">
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p>Admin bilan suhbatni boshlang!</p>
        </div>
      </div>

      <!-- Input -->
      <div class="chat-footer">
        <input
          v-model="messageInput"
          class="chat-footer__input"
          placeholder="Xabar yozing..."
          @keyup.enter="sendMessage" />
        <button
          class="chat-footer__send"
          :disabled="!messageInput.trim()"
          @click="sendMessage">
          <svg
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
    </main>
  </div>
</template>

<style lang="scss" scoped>
.chat-page {
  display: flex;
  height: calc(100vh - 60px);
  overflow: hidden;
  background: #fff;
  border: 1px solid #e8e8ed;
  border-radius: 18px;
}

.chat-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  background: #fff;
}

.chat-head {
  display: flex;
  flex-shrink: 0;
  gap: 14px;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f3;

  &__avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
  }

  &__name {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #1a1a2e;
  }

  &__sub {
    font-size: 13px;
    font-weight: 500;
    color: #10b981;
  }
}

.chat-messages {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  padding: 20px 24px;
  overflow-y: auto;
  background: #f5f5fa;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 2px;
  }

  &__empty {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #bbb;

    .empty-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 72px;
      height: 72px;
      background: #ededf3;
      border-radius: 50%;
    }
  }
}

.date-sep {
  display: flex;
  justify-content: center;
  padding: 12px 0 6px;

  span {
    padding: 4px 14px;
    font-size: 11.5px;
    font-weight: 500;
    color: #888;
    background: #e8e8f0;
    border-radius: 10px;
  }
}

.msg {
  display: flex;
  width: 100%;

  &:first-child {
    margin-top: auto;
  }

  &--mine {
    justify-content: flex-end;

    .msg__bubble {
      color: #fff;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      border-bottom-right-radius: 6px;
    }

    .msg__time {
      color: rgb(255 255 255 / 60%);
    }
  }

  &:not(.msg--mine) {
    justify-content: flex-start;

    .msg__bubble {
      color: #1a1a2e;
      background: #fff;
      border-bottom-left-radius: 6px;
      box-shadow: 0 1px 4px rgb(0 0 0 / 6%);
    }

    .msg__time {
      color: #bbb;
    }
  }

  &__bubble {
    max-width: 65%;
    padding: 10px 14px 6px;
    border-radius: 18px;
    animation: msgIn 0.2s ease;
  }

  &__text {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
    white-space: pre-wrap;
  }

  &__time {
    display: block;
    margin-top: 3px;
    font-size: 10px;
    text-align: right;
  }
}

@keyframes msgIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-footer {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
  align-items: center;
  padding: 14px 20px;
  background: #fff;
  border-top: 1px solid #f0f0f3;

  &__input {
    flex: 1;
    height: 44px;
    padding: 0 18px;
    font-family: Montserrat, sans-serif;
    font-size: 14px;
    color: #333;
    outline: none;
    background: #f5f5fa;
    border: none;
    border-radius: 22px;
    transition: background 0.2s;

    &:focus {
      background: #ededf3;
    }

    &::placeholder {
      color: #aaa;
    }
  }

  &__send {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    color: #fff;
    cursor: pointer;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    border: none;
    border-radius: 50%;
    transition:
      opacity 0.2s,
      transform 0.15s;

    &:hover {
      opacity: 0.9;
    }

    &:active {
      transform: scale(0.93);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
  }
}
</style>
