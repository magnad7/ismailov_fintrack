<script setup lang="ts">
const isVisible = defineModel<boolean>("isVisible", { default: false });
const eventForm = defineModel<any>("eventForm", { required: true });

const { isEditing } = defineProps<{
  eventColors: { name: string; value: string }[];
  isEditing: boolean;
  isSaving?: boolean;
}>();

const emit = defineEmits(["save", "delete"]);

const isIncome = computed(() => {
  const title = eventForm.value?.title || "";
  return title.startsWith("+");
});

const amountDisplay = computed(() => {
  const title = eventForm.value?.title || "";
  return title;
});

const close = () => {
  isVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="isVisible"
    width="480"
    align-center
    :show-close="false"
    class="tx-dialog"
    @close="close">
    <template #header>
      <div class="tx-dialog-head">
        <div
          class="tx-dialog-head__badge"
          :class="isIncome ? 'income' : 'expense'">
          <svg
            v-if="isIncome"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          <svg
            v-else
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
          </svg>
        </div>
        <div class="tx-dialog-head__info">
          <span class="tx-dialog-head__type">
            {{ isIncome ? "Daromad" : "Xarajat" }}
          </span>
          <h3
            class="tx-dialog-head__amount"
            :class="isIncome ? 'income' : 'expense'">
            {{ amountDisplay }}
          </h3>
        </div>
        <button
          class="tx-dialog-head__close"
          @click="close">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <line
              x1="18"
              y1="6"
              x2="6"
              y2="18" />
            <line
              x1="6"
              y1="6"
              x2="18"
              y2="18" />
          </svg>
        </button>
      </div>
    </template>

    <div class="tx-dialog-body">
      <!-- Date & Time -->
      <div class="tx-detail">
        <div class="tx-detail__icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2" />
            <line
              x1="16"
              y1="2"
              x2="16"
              y2="6" />
            <line
              x1="8"
              y1="2"
              x2="8"
              y2="6" />
            <line
              x1="3"
              y1="10"
              x2="21"
              y2="10" />
          </svg>
        </div>
        <div class="tx-detail__content">
          <span class="tx-detail__label">Sana</span>
          <span class="tx-detail__value">{{ eventForm.date }}</span>
        </div>
      </div>

      <div class="tx-detail">
        <div class="tx-detail__icon">
          <svg
            width="16"
            height="16"
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
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div class="tx-detail__content">
          <span class="tx-detail__label">Vaqt</span>
          <span class="tx-detail__value">
            {{ eventForm.startTime }} – {{ eventForm.endTime }}
          </span>
        </div>
      </div>

      <!-- Description -->
      <div
        v-if="eventForm.description"
        class="tx-detail">
        <div class="tx-detail__icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <line
              x1="17"
              y1="10"
              x2="3"
              y2="10" />
            <line
              x1="21"
              y1="6"
              x2="3"
              y2="6" />
            <line
              x1="21"
              y1="14"
              x2="3"
              y2="14" />
            <line
              x1="17"
              y1="18"
              x2="3"
              y2="18" />
          </svg>
        </div>
        <div class="tx-detail__content">
          <span class="tx-detail__label">Izoh</span>
          <span class="tx-detail__value">{{ eventForm.description }}</span>
        </div>
      </div>

      <!-- User Info -->
      <div
        v-if="eventForm.userName && eventForm.userName !== '—'"
        class="tx-detail">
        <div class="tx-detail__icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle
              cx="12"
              cy="7"
              r="4" />
          </svg>
        </div>
        <div class="tx-detail__content">
          <span class="tx-detail__label">Xodim</span>
          <span class="tx-detail__value">{{ eventForm.userName }}</span>
        </div>
      </div>

      <!-- Project Info -->
      <div
        v-if="eventForm.projectName && eventForm.projectName !== '—'"
        class="tx-detail">
        <div class="tx-detail__icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path
              d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div class="tx-detail__content">
          <span class="tx-detail__label">Loyiha</span>
          <span class="tx-detail__value">{{ eventForm.projectName }}</span>
        </div>
      </div>

      <!-- Expense Type Info -->
      <div
        v-if="eventForm.expenseType && eventForm.expenseType !== '—'"
        class="tx-detail">
        <div class="tx-detail__icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <line
              x1="12"
              y1="1"
              x2="12"
              y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div class="tx-detail__content">
          <span class="tx-detail__label">Xarajat turi</span>
          <span class="tx-detail__value">{{ eventForm.expenseType }}</span>
        </div>
      </div>

      <!-- Color indicator -->
      <div class="tx-detail">
        <div class="tx-detail__icon">
          <div
            class="tx-color-dot"
            :style="{ background: eventForm.color }"></div>
        </div>
        <div class="tx-detail__content">
          <span class="tx-detail__label">Tur</span>
          <span class="tx-detail__value">
            <span
              class="tx-type-chip"
              :class="isIncome ? 'income' : 'expense'">
              {{ isIncome ? "Daromad" : "Xarajat" }}
            </span>
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="tx-dialog-footer">
        <button
          class="tx-btn tx-btn--ghost"
          @click="close">
          Yopish
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.tx-dialog-head {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 4px 0;

  &__badge {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 14px;

    &.income {
      color: #10b981;
      background: #ecfdf5;
    }

    &.expense {
      color: #ef4444;
      background: #fef2f2;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__type {
    font-size: 12px;
    font-weight: 500;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__amount {
    margin: 2px 0 0;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.2;

    &.income {
      color: #10b981;
    }

    &.expense {
      color: #ef4444;
    }
  }

  &__close {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: #9ca3af;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 8px;
    transition: all 0.15s;

    &:hover {
      color: #374151;
      background: #f3f4f6;
    }
  }
}

.tx-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tx-detail {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: #9ca3af;
    background: #f9fafb;
    border-radius: 8px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__label {
    font-size: 11.5px;
    font-weight: 500;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__value {
    font-size: 14.5px;
    font-weight: 600;
    color: #1f2937;
  }
}

.tx-color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 3px rgb(0 0 0 / 8%);
}

.tx-type-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;

  &.income {
    color: #059669;
    background: #ecfdf5;
  }

  &.expense {
    color: #dc2626;
    background: #fef2f2;
  }
}

.tx-dialog-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.tx-btn {
  padding: 8px 20px;
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  border-radius: 10px;
  transition: all 0.15s;

  &--ghost {
    color: #6b7280;
    background: #f3f4f6;

    &:hover {
      color: #374151;
      background: #e5e7eb;
    }
  }
}

// Override el-dialog styles
:deep(.el-dialog) {
  overflow: hidden;
  border-radius: 18px !important;
}

:deep(.el-dialog__header) {
  padding: 20px 24px 12px !important;
  margin-right: 0 !important;
}

:deep(.el-dialog__body) {
  padding: 0 24px !important;
}

:deep(.el-dialog__footer) {
  padding: 12px 24px 20px !important;
}
</style>
