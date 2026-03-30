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
const search = ref("");
const selectedEmployee = ref<any>(null);
const messageInput = ref("");
const messages = ref<any[]>([]);
const messagesContainer = ref<HTMLElement | null>(null);
const loadingMessages = ref(false);
let unsubMessages: (() => void) | null = null;

// Fetch all users
const { data: allUsers } = useCollection(collection(db, "users"));

const myProfile = computed(
  () => allUsers.value.find((u: any) => u.id === currentUser.value?.uid) || null
);

const employees = computed(() =>
  allUsers.value.filter((u: any) => u.role === "employee")
);

// Fetch chats
const chatsQuery = computed(() => {
  if (!currentUser.value) return null;
  return query(
    collection(db, "chats"),
    where("participants", "array-contains", currentUser.value.uid)
  );
});
const { data: chats } = useCollection(chatsQuery);

// Employee list with chat info
const employeeList = computed(() =>
  employees.value
    .map((emp: any) => {
      const chatId = getChatId(currentUser.value?.uid, emp.id);
      const chat = chats.value?.find((c: any) => c.id === chatId);
      return {
        chatId,
        email: emp.email,
        id: emp.id,
        lastMessage: chat?.lastMessage || "",
        lastMessageAt: chat?.lastMessageAt || null,
        name: emp.name,
      };
    })
    .sort((a: any, b: any) => {
      const ta = a.lastMessageAt?.toMillis?.() || 0;
      const tb = b.lastMessageAt?.toMillis?.() || 0;
      return tb - ta;
    })
);

const filteredList = computed(() => {
  if (!search.value.trim()) return employeeList.value;
  const q = search.value.toLowerCase();
  return employeeList.value.filter((e: any) =>
    e.name?.toLowerCase().includes(q)
  );
});

// Helpers
const getChatId = (uid1: string | undefined, uid2: string) => {
  if (!uid1 || !uid2) return "";
  return [uid1, uid2].sort().join("_");
};

const getInitials = (name: string) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const gradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
  "linear-gradient(135deg, #30cfd0, #330867)",
  "linear-gradient(135deg, #fccb90, #d57eeb)",
];

const getGradient = (name: string) =>
  gradients[(name?.charCodeAt(0) || 0) % gradients.length];

// Select employee & listen to messages
const selectEmployee = (emp: any) => {
  if (selectedEmployee.value?.id === emp.id) return;
  selectedEmployee.value = emp;
  messages.value = [];
  loadingMessages.value = true;

  if (unsubMessages) unsubMessages();

  const chatId = getChatId(currentUser.value?.uid, emp.id);
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc")
  );

  unsubMessages = onSnapshot(q, (snap) => {
    messages.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    loadingMessages.value = false;
    scrollToBottom();
  });
};

// Send message
const sendMessage = async () => {
  const text = messageInput.value.trim();
  if (!text || !selectedEmployee.value || !currentUser.value) return;
  messageInput.value = "";

  const chatId = getChatId(currentUser.value.uid, selectedEmployee.value.id);
  const senderName = myProfile.value?.name || "Admin";

  try {
    await setDoc(
      doc(db, "chats", chatId),
      {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        lastSenderId: currentUser.value.uid,
        participants: [currentUser.value.uid, selectedEmployee.value.id].sort(),
      },
      { merge: true }
    );

    await addDoc(collection(db, "chats", chatId, "messages"), {
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

const formatLastTime = (ts: any) => {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Kecha";
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const getDateLabel = (ts: any) => {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Bugun";
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Kecha";
  return d.toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "long",
  });
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
    <!-- ──── Sidebar ──── -->
    <aside class="sidebar">
      <div class="sidebar__head">
        <h2 class="sidebar__title">
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
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Xabarlar
        </h2>
      </div>

      <div class="sidebar__search">
        <svg
          class="sidebar__search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2">
          <circle
            cx="11"
            cy="11"
            r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          v-model="search"
          class="sidebar__search-input"
          placeholder="Qidirish..." />
      </div>

      <div class="sidebar__list">
        <div
          v-for="emp in filteredList"
          :key="emp.id"
          class="contact"
          :class="{ 'contact--active': selectedEmployee?.id === emp.id }"
          @click="selectEmployee(emp)">
          <div
            class="contact__avatar"
            :style="{ background: getGradient(emp.name) }">
            {{ getInitials(emp.name) }}
          </div>
          <div class="contact__body">
            <div class="contact__row">
              <span class="contact__name">{{ emp.name }}</span>
              <span class="contact__time">
                {{ formatLastTime(emp.lastMessageAt) }}
              </span>
            </div>
            <p class="contact__msg">
              {{ emp.lastMessage || "Xabar yo'q" }}
            </p>
          </div>
        </div>

        <div
          v-if="filteredList.length === 0"
          class="sidebar__empty">
          <svg
            width="40"
            height="40"
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
          <span>Xodim topilmadi</span>
        </div>
      </div>
    </aside>

    <!-- ──── Chat Area ──── -->
    <main class="chat-main">
      <!-- Empty State -->
      <div
        v-if="!selectedEmployee"
        class="chat-empty">
        <div class="chat-empty__icon">
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c7c7cc"
            stroke-width="1.2">
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h3>Suhbatni tanlang</h3>
        <p>Chap paneldan xodimni tanlab suhbatni boshlang</p>
      </div>

      <!-- Active Chat -->
      <template v-else>
        <!-- Header -->
        <div class="chat-head">
          <div
            class="chat-head__avatar"
            :style="{ background: getGradient(selectedEmployee.name) }">
            {{ getInitials(selectedEmployee.name) }}
          </div>
          <div class="chat-head__info">
            <h3 class="chat-head__name">{{ selectedEmployee.name }}</h3>
            <span class="chat-head__sub">{{ selectedEmployee.email }}</span>
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
              :class="{
                'msg--mine': msg.senderId === currentUser?.uid,
              }">
              <div class="msg__bubble">
                <p class="msg__text">{{ msg.text }}</p>
                <span class="msg__time">{{ formatTime(msg.createdAt) }}</span>
              </div>
            </div>
          </template>

          <div
            v-if="!loadingMessages && messages.length === 0"
            class="chat-messages__empty">
            <p>Hali xabar yo'q. Birinchi xabarni yuboring!</p>
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
      </template>
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

/* ──── Sidebar ──── */
.sidebar {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  width: 340px;
  background: #fafafe;
  border-right: 1px solid #f0f0f3;

  &__head {
    padding: 24px 24px 0;
  }

  &__title {
    display: flex;
    gap: 10px;
    align-items: center;
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #1a1a2e;
  }

  &__search {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 16px;
    margin: 18px 16px 10px;
    background: #f0f0f5;
    border-radius: 12px;
    transition: background 0.2s;

    &:focus-within {
      background: #e8e8f0;
    }
  }

  &__search-icon {
    flex-shrink: 0;
    color: #9ca3af;
  }

  &__search-input {
    width: 100%;
    font-family: Montserrat, sans-serif;
    font-size: 14px;
    color: #333;
    outline: none;
    background: transparent;
    border: none;

    &::placeholder {
      color: #aaa;
    }
  }

  &__list {
    flex: 1;
    padding: 6px 10px 16px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #e0e0e0;
      border-radius: 2px;
    }
  }

  &__empty {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    padding: 48px 0;
    font-size: 13px;
    color: #999;
  }
}

/* ──── Contact Item ──── */
.contact {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 12px 14px;
  cursor: pointer;
  border-radius: 14px;
  transition:
    background 0.15s,
    transform 0.1s;

  &:hover {
    background: #ededf3;
  }

  &--active {
    background: #e8e8f5;

    .contact__name {
      color: #4f46e5;
    }
  }

  &__avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 3px;
  }

  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    font-weight: 600;
    color: #1a1a2e;
    white-space: nowrap;
  }

  &__time {
    flex-shrink: 0;
    font-size: 11px;
    color: #aaa;
  }

  &__msg {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12.5px;
    color: #888;
    white-space: nowrap;
  }
}

/* ──── Chat Main ──── */
.chat-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  background: #fff;
}

.chat-empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  color: #aaa;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    margin-bottom: 8px;
    background: #f5f5fa;
    border-radius: 50%;
  }

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #555;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

/* ──── Chat Header ──── */
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
    width: 42px;
    height: 42px;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    border-radius: 50%;
  }

  &__name {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #1a1a2e;
  }

  &__sub {
    font-size: 12px;
    color: #999;
  }
}

/* ──── Messages ──── */
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
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #bbb;
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
    position: relative;
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

/* ──── Chat Footer ──── */
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
