<script setup lang="ts">
const isVisible = defineModel<boolean>("isVisible", { default: false });
defineProps<{
  date: string;
  events: CalendarEvent[];
}>();

defineEmits(["select-event"]);

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  });
};
</script>

<template>
  <div
    v-if="isVisible"
    class="dialog-overlay"
    @click.self="isVisible = false">
    <div class="more-events-dialog">
      <div class="dialog-header">
        <h3>{{ formatDate(date) }}</h3>
        <button
          class="close-btn"
          @click="isVisible = false">
          ✕
        </button>
      </div>
      <div class="dialog-body">
        <div
          v-for="event in events"
          :key="event.id"
          class="more-event-item"
          :style="{ borderLeftColor: event.color }"
          @click="$emit('select-event', event)">
          <div
            v-if="event.startTime"
            class="more-event-time">
            {{ event.startTime }} - {{ event.endTime }}
          </div>
          <div class="more-event-title">{{ event.title }}</div>
        </div>
      </div>
    </div>
  </div>
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

.more-events-dialog {
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow:
    0 24px 38px 3px rgb(0 0 0 / 14%),
    0 9px 46px 8px rgb(0 0 0 / 12%),
    0 11px 15px -7px rgb(0 0 0 / 20%);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 8px 16px;
  border-bottom: 1px solid #dadce0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #70757a;
  text-transform: uppercase;
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
  max-height: 400px;
  padding: 8px;
  overflow-y: auto;
}

.more-event-item {
  padding: 4px 8px;
  margin-bottom: 2px;
  cursor: pointer;
  border-left: 4px solid #1a73e8;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.more-event-item:hover {
  background-color: #f1f3f4;
}

.more-event-time {
  font-size: 11px;
  color: #70757a;
}

.more-event-title {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}
</style>
