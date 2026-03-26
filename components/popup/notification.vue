<script setup lang="ts">
import { useRouter } from "vue-router";

import {
  type NotificationItem,
  useNotificationStore,
} from "@/store/notification";

const emit = defineEmits<{
  (e: "cancel"): void;
}>();

const visible = defineModel<boolean>("visible", {
  default: false,
  type: Boolean,
});

const notificationStore = useNotificationStore();
const router = useRouter();

const close = (): void => {
  emit("cancel");
};

const openNotification = async (item: NotificationItem) => {
  visible.value = false;
  if (item.order_id) {
    router.push(`/cabinet/confirmer/orders/${item.order_id}`);
  }
};
</script>

<template>
  <el-dialog
    v-model="visible"
    width="500"
    align-center
    class="notification-dialog"
    @close="close">
    <template #header>
      <div class="header-content">
        <h2 class="title d-flex align-center w-auto">
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
            class="lucide lucide-bell w-5 h-5 mr-8"
            aria-hidden="true">
            <path d="M10.268 21a2 2 0 0 0 3.464 0"></path>
            <path
              d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path>
          </svg>
          Bildirishnomalar ({{ notificationStore.count }})
        </h2>
        <button
          class="cancel-btn"
          @click="notificationStore.markAsRead">
          Barchasini o'qilgan deb belgilash
        </button>
      </div>
    </template>

    <div class="notification-list">
      <el-scrollbar max-height="400px">
        <div
          v-if="notificationStore.notificationsList.length === 0"
          class="empty-state">
          <p>Bildirishnomalar yo'q</p>
        </div>
        <div
          v-for="(item, index) in notificationStore.notificationsList"
          :key="index"
          class="notification-item"
          @click="openNotification(item)">
          <div class="item-container">
            <div class="icon-wrapper">
              <div
                v-if="!item.read_at"
                class="unread-indicator"></div>
            </div>
            <div class="content">
              <h3 class="item-title">{{ item.title || "Yangi xabar" }}</h3>
              <p class="item-message">
                {{ item.message || item.data?.message }}
              </p>
              <span class="item-date">
                {{
                  item.time ||
                  (item.created_at
                    ? new Date(item.created_at).toLocaleTimeString("uz-UZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "")
                }}
              </span>
            </div>
          </div>
        </div>
        <div
          v-if="notificationStore.notificationsList.length > 0"
          class="view-all-wrapper">
          <el-button
            link
            type="primary"
            @click="
              () => {
                visible = false;
                router.push('/cabinet/confirmer/notification');
              }
            ">
            Barchasini ko'rish
          </el-button>
        </div>
      </el-scrollbar>
    </div>
  </el-dialog>
</template>

<style scoped>
.notification-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
  padding-bottom: 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.empty-state {
  padding: 1rem 0;
  text-align: center;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
}

.notification-item {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  background-color: #f9fafb;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f3f4f6;
}

.item-container {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  width: 10px;
}

.unread-indicator {
  width: 0.5rem;
  height: 0.5rem;
  margin-top: 0.5rem;
  background-color: #3b82f6;
  border-radius: 50%;
}

.content {
  flex: 1;
}

.item-title {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.item-message {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  color: #4b5563;
  overflow-wrap: break-word;
}

.item-date {
  font-size: 0.75rem;
  color: #9ca3af;
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

.view-all-wrapper {
  padding-top: 8px;
  padding-bottom: 4px;
  margin-top: 8px;
  text-align: center;
  border-top: 1px solid #f3f4f6;
}
</style>
