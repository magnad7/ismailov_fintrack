<script setup lang="ts">
import { useI18n } from "vue-i18n";
// --- Props & Emits ---
defineProps<{
  item: StatementPending;
}>();

defineEmits<{
  (e: "cancel"): void;
}>();

// --- Model ---
const visible = defineModel<boolean>("visible", {
  default: false,
});

// --- Setup ---
const config = useRuntimeConfig();
const { locale, t } = useI18n();

// --- Metodlar ---
const calculatePercentageByApprovals = (item: StatementPending): number => {
  if (!item.approvals || item.approvals.length === 0) return 0;

  const totalApprovals = item.approvals.length;
  const acceptedApprovals = item.approvals.filter(
    (approval) => approval.status !== "pending"
  ).length;

  return Math.round((acceptedApprovals / totalApprovals) * 100);
};
</script>

<template>
  <el-dialog
    v-model="visible"
    width="1000px"
    align-center>
    <div class="statement-header">
      <div class="statement-header-left">
        <div class="statement-main-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path
              d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
            <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
            <path d="M10 9H8"></path>
            <path d="M16 13H8"></path>
            <path d="M16 17H8"></path>
          </svg>
        </div>
        <div class="statement-title-block">
          <h3 class="statement-title">
            {{ item.statement_type?.[locale] }}
          </h3>
          <p class="statement-subtitle">
            👤 Автор:
            <b>{{ item.author.fullname }}</b>
          </p>
          <p class="statement-subtitle">
            🏢 Отдел:
            <b>{{ item.author.department?.[locale] }}</b>
          </p>
          <p class="statement-subtitle">
            📆 Создан:
            <b>{{ item.create_date }}</b>
          </p>
          <p class="statement-subtitle">
            ⚡ Приоритет:
            <span class="priority-chip">
              {{ t("priority." + item.priority) }}
            </span>
          </p>
        </div>
      </div>

      <div class="statement-header-right">
        <div
          class="status-pill"
          :class="'status-' + item.status">
          <span v-if="item.status === 'pending' || item.status === 'approve'">
            ⏳ На рассмотрении
          </span>
          <span v-else-if="item.status === 'accept'">✅ Подтверждено</span>
          <span v-else>❌ Отклонено</span>
        </div>
      </div>
    </div>

    <div class="d-flex between">
      <p class="statement-subtitle mb-8">Подтверждение прогресса</p>
      <p class="statement-subtitle mb-8">
        {{
          item.approvals?.filter((a) => a.status !== "pending").length || 0
        }}/{{ item.approvals?.length || 0 }}
        {{ calculatePercentageByApprovals(item) }}%
      </p>
    </div>

    <el-progress
      class="mb-20"
      :percentage="calculatePercentageByApprovals(item)"
      :show-text="false" />

    <div class="statement-body">
      <div class="reason-header">
        <span class="reason-title">📝 Текст приказа</span>
      </div>
      <div class="reason-box">
        <p class="reason-text">{{ item.reason }}</p>
      </div>
    </div>

    <div
      v-if="item.approvals?.length"
      class="approvals-section">
      <div class="approvals-header">
        <span class="approvals-title">✅ Согласование</span>
        <span class="approvals-count">
          {{ item.approvals.length }} согласующих
        </span>
      </div>

      <el-row
        class="approvals-row gap-20"
        :gutter="20">
        <el-col
          v-for="(approval, index) in item.approvals"
          :key="index"
          :xs="24">
          <div class="approval-card">
            <div class="approval-card-header">
              <span
                v-if="approval.approver_fullname"
                class="approval-name">
                👤
                <b>{{ approval.approver_fullname }}</b>
              </span>
              <el-tag
                size="small"
                effect="light"
                :type="
                  approval.status === 'pending'
                    ? 'warning'
                    : approval.status === 'accept'
                      ? 'success'
                      : 'danger'
                ">
                {{
                  approval.status === "pending"
                    ? "На рассмотрении"
                    : approval.status === "accept"
                      ? "Подтверждено"
                      : "Отклонено"
                }}
              </el-tag>
            </div>

            <div
              v-if="approval.handmade_signature || approval.comment"
              class="d-flex"
              style="align-items: flex-start">
              <div class="approval-info w-full">
                <span
                  v-if="approval.comment"
                  class="approval-line">
                  💬 Комментарий:
                  <b>{{ approval.comment }}</b>
                </span>
                <span
                  v-if="approval.approved_at"
                  class="approval-line">
                  📅 Дата утверждения:
                  <b>{{ approval.approved_at }}</b>
                </span>
              </div>

              <div
                v-if="
                  approval.status !== 'pending' && approval.handmade_signature
                "
                class="approval-signature">
                <span class="signature-label d-block">✍️ Подпись:</span>
                <div class="signature-box">
                  <img
                    :src="config.public.apiImgUrl + approval.handmade_signature"
                    alt="Подпись" />
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-dialog>
</template>

<style scoped>
/* Header qismi */
.statement-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.statement-header-left {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.statement-main-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #eef2ff, #e0f2fe);
  border-radius: 12px;
}

.statement-title-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.statement-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.statement-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

/* O'ng taraf (status, data, prioritet) */
.statement-header-right {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  min-width: 180px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 999px;
}

/* Status ranglari */
.status-pending,
.status-approve {
  color: #92400e;
  background-color: #fef9c3;
}

.status-accept {
  color: #166534;
  background-color: #dcfce7;
}

.status-reject,
.status-rejected,
.status-decline {
  color: #991b1b;
  background-color: #fee2e2;
}

.meta-line {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
}

.meta-label {
  color: #9ca3af;
}

.meta-value {
  font-weight: 500;
  color: #111827;
}

.priority-chip {
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  color: #1d4ed8;
  background: #eff6ff;
  border-radius: 999px;
}

/* Body / reason */
.statement-body {
  margin-bottom: 14px;
}

.reason-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.reason-title {
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
}

.reason-box {
  padding: 10px 12px;
  background: #f9fafb;
  border: 1px dashed #e5e7eb;
  border-radius: 10px;
}

.reason-text {
  margin: 0;
  font-size: 13px;
  color: #111827;
  white-space: pre-wrap;
}

/* Approvals */
.approvals-section {
  margin-top: 10px;
}

.approvals-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.approvals-title {
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
}

.approvals-count {
  font-size: 12px;
  color: #6b7280;
}

.approvals-row {
  margin-top: 4px;
}

.approval-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.approval-card-header {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
}

.approval-name {
  font-size: 13px;
  color: #111827;
}

.approval-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.approval-line {
  font-size: 14px;
  color: #4b5563;
}

.approval-signature {
  margin-top: 6px;
}

.signature-label {
  font-size: 12px;
  color: #6b7280;
}

.signature-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  margin-top: 4px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.signature-box img {
  max-width: 100%;
  max-height: 80px;
  object-fit: contain;
  mix-blend-mode: multiply;
}

/* Responsive */
@media (width <= 768px) {
  .statement-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .statement-header-right {
    align-items: flex-start;
  }
}
</style>
