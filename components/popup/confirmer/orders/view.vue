<script setup lang="ts">
import { computed } from "vue";

interface ConfirmerOrder {
  approvals: ConfirmerOrderApproval[];
  author: ConfirmerOrderAuthor;
  author_id: number;
  created_at: string;
  deadline: string;
  details: string;
  id: number;
  is_all: boolean;
  order_source: "standalone" | "statement_based";
  order_type: ConfirmerOrderType;
  order_type_category: string;
  order_type_id: number;
  priority: string;
  responsible_persons: string;
  statement: ConfirmerOrderStatement;
  statement_id: null | number;
  status: string;
  target_users: unknown[];
  title: string;
  updated_at: string;
}

interface ConfirmerOrderApproval {
  approved_at: null | string;
  approver: ConfirmerOrderApprovalUser;
  approver_id: number;
  comment: null | string;
  created_at: string;
  handmade_signature: null | string;
  id: number;
  order_id: number;
  sender: ConfirmerOrderApprovalUser;
  sender_id: number;
  status: string;
}

interface ConfirmerOrderApprovalUser {
  fullname: string;
  id: number;
}

interface ConfirmerOrderAuthor {
  email: string;
  fullname: string;
  id: number;
  role: string;
}

interface ConfirmerOrderStatement {
  id: number;
  priority: string;
  reason: string;
  status: string;
  title: string;
}

interface ConfirmerOrderType {
  active: boolean | string;
  id: number;
  title_en: string;
  title_ru: string;
  title_uz: string;
}

const props = defineProps<{
  obj: ConfirmerOrder | null;
}>();

const visible = defineModel<boolean>("visible", {
  default: false,
});

const { locale, t } = useI18n();

const order = computed(() => props.obj);

const getPriorityTagType = (
  priority: string
): "danger" | "info" | "success" | "warning" => {
  if (priority === "high") return "danger";
  if (priority === "medium") return "warning";
  if (priority === "low") return "info";
  return "success";
};

const getStatusTagType = (
  status: string
): "danger" | "info" | "success" | "warning" => {
  if (status === "pending") return "warning";
  if (status === "accept") return "success";
  if (status === "reject") return "danger";
  return "info";
};
</script>

<template>
  <el-dialog
    v-model="visible"
    width="700px"
    align-center
    class="compact-dialog">
    <template #header>
      <div
        v-if="order"
        class="dialog-header">
        <div class="dialog-title">
          <div class="dialog-title-main">
            <h2>{{ order.title }}</h2>
            <span class="dialog-subtitle">
              № {{ order.id }} · {{ order.created_at }}
            </span>
          </div>
          <el-tag
            :type="getStatusTagType(order.status)"
            size="small">
            {{
              order.status === "pending"
                ? "На рассмотрении"
                : order.status === "accept"
                  ? "Подтверждено"
                  : "Отклонено"
            }}
          </el-tag>
        </div>

        <div class="dialog-meta">
          <div class="meta-block">
            <span class="meta-label">Автор</span>
            <span class="meta-value">{{ order.author.fullname }}</span>
          </div>
          <span class="meta-dot" />
          <div class="meta-block">
            <span class="meta-label">Тип приказа</span>
            <span class="meta-value">
              {{
                locale === "uz"
                  ? order.order_type.title_uz
                  : locale === "en"
                    ? order.order_type.title_en
                    : order.order_type.title_ru
              }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <div v-if="order">
      <div class="summary">
        <div class="summary-item">
          <div class="summary-label-row">
            <span class="summary-badge deadline" />
            <span class="summary-label">Крайний срок</span>
          </div>
          <span class="summary-value strong">{{ order.deadline }}</span>
        </div>
        <div class="summary-item">
          <div class="summary-label-row">
            <span class="summary-badge priority" />
            <span class="summary-label">Приоритет</span>
          </div>
          <el-tag
            :type="getPriorityTagType(order.priority)"
            size="small">
            {{ t("priority." + order.priority) }}
          </el-tag>
        </div>
        <div class="summary-item">
          <div class="summary-label-row">
            <span class="summary-badge responsible" />
            <span class="summary-label">Ответственные лица</span>
          </div>
          <span class="summary-value multiline">
            {{ order.responsible_persons }}
          </span>
        </div>
      </div>

      <el-collapse class="mt-5">
        <el-collapse-item
          title="Описание приказа"
          name="main">
          <div class="section-body">
            <p class="details-text">
              {{ order.details || "Нет детального описания" }}
            </p>
          </div>
        </el-collapse-item>

        <el-collapse-item
          v-if="order.statement"
          title="Заявление"
          name="statement">
          <div class="section-body">
            <div class="row">
              <span class="label">Название заявления:</span>
              <span class="value">{{ order.statement.title || "—" }}</span>
            </div>
            <div class="row">
              <span class="label">Причина:</span>
              <span class="value">{{ order.statement.reason || "—" }}</span>
            </div>
            <div class="row">
              <span class="label">Статус заявления:</span>
              <span class="value">{{ order.statement.status || "—" }}</span>
            </div>
            <div class="row">
              <span class="label">Приоритет заявления:</span>
              <span class="value">
                {{ t("priority." + order.statement.priority) }}
              </span>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item
          title="Утверждения"
          name="approvals">
          <div
            v-if="order.approvals && order.approvals.length"
            class="approvals-list">
            <div
              v-for="item in order.approvals"
              :key="item.id"
              class="approval-item">
              <div class="approval-header">
                <span class="approval-user">
                  {{ item.approver.fullname }}
                </span>
                <el-tag
                  :type="getStatusTagType(item.status)"
                  size="small">
                  {{ item.status }}
                </el-tag>
              </div>
              <div class="approval-meta">
                <span>Отправитель: {{ item.sender.fullname }}</span>
                <span>Создано: {{ item.created_at }}</span>
                <span v-if="item.approved_at">
                  Подтверждено: {{ item.approved_at }}
                </span>
              </div>
              <p
                v-if="item.comment"
                class="approval-comment">
                {{ item.comment }}
              </p>
            </div>
          </div>
          <div
            v-else
            class="empty-text">
            Нет данных об утверждениях
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-dialog>
</template>

<style scoped>
.row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #eee;
}

.label {
  font-size: 13px;
  font-weight: 600;
}

.value {
  max-width: 250px;
  font-size: 13px;
  color: #444;
  text-align: right;
  overflow-wrap: break-word;
}

.dialog-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dialog-title {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.dialog-title-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dialog-title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.dialog-subtitle {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.dialog-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

.meta-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.meta-label {
  font-size: 11px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.meta-value {
  font-size: 12px;
  color: #444;
}

.meta-dot {
  width: 4px;
  height: 4px;
  background-color: #d0d0d0;
  border-radius: 999px;
}

.summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  background-color: #fafafa;
  border-radius: 8px;
}

.summary-label-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.summary-badge {
  width: 16px;
  height: 16px;
  border-radius: 999px;
}

.summary-badge.deadline {
  background: linear-gradient(135deg, #f97316, #facc15);
}

.summary-badge.priority {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.summary-badge.responsible {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
}

.summary-label {
  font-size: 12px;
  color: #888;
}

.summary-value {
  font-size: 13px;
  color: #333;
}

.summary-value.strong {
  font-weight: 600;
}

.summary-value.multiline {
  white-space: pre-wrap;
}

.section-body {
  padding-top: 4px;
}

.details-text {
  font-size: 13px;
  line-height: 1.5;
  color: #333;
  white-space: pre-wrap;
}

.approvals-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.approval-item {
  padding: 8px 10px;
  background-color: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.approval-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.approval-user {
  font-size: 13px;
  font-weight: 600;
}

.approval-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #666;
}

.approval-comment {
  margin-top: 6px;
  font-size: 13px;
  color: #333;
}

.empty-text {
  font-size: 13px;
  color: #888;
}
</style>
