<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useCollection, useFirestore } from "vuefire";

const db = useFirestore();
const projectsRef = collection(db, "projects");
const { data: projects, pending } = useCollection(projectsRef);

const dialogVisible = ref(false);
const isEditing = ref(false);
const editingId = ref<null | string>(null);
const loading = ref(false);

const form = ref({
  description: "",
  name: "",
});

const openCreateDialog = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = { description: "", name: "" };
  dialogVisible.value = true;
};

const openEditDialog = (project: any) => {
  isEditing.value = true;
  editingId.value = project.id;
  form.value = { description: project.description, name: project.name };
  dialogVisible.value = true;
};

const onSave = async () => {
  if (!form.value.name.trim()) return;
  loading.value = true;
  try {
    if (isEditing.value && editingId.value) {
      await updateDoc(doc(db, "projects", editingId.value), {
        description: form.value.description,
        name: form.value.name,
      });
      ElMessage.success("Project updated successfully");
    } else {
      await addDoc(projectsRef, {
        createdAt: serverTimestamp(),
        description: form.value.description,
        name: form.value.name,
      });
      ElMessage.success("New project created");
    }
    dialogVisible.value = false;
  } catch (err: any) {
    ElMessage.error(err.message || "An error occurred");
  } finally {
    loading.value = false;
  }
};

const onDelete = (project: any) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete "${project.name}"?`,
    "Warning",
    {
      cancelButtonText: "Cancel",
      confirmButtonText: "Delete",
      type: "warning",
    }
  )
    .then(async () => {
      try {
        await deleteDoc(doc(db, "projects", project.id));
        ElMessage.success("Project deleted");
      } catch (error: any) {
        ElMessage.error("Error deleting: " + error.message);
      }
    })
    .catch(() => {});
};

const formatDate = (ts: any) => {
  if (!ts?.toDate) return "Unknown";
  return new Date(ts.toDate()).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
</script>

<template>
  <div class="admin-projects-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <span class="header-icon-box">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </span>
        <h1 class="header-title">Projects</h1>
      </div>
      <div class="header-right">
        <button
          class="primary-btn"
          @click="openCreateDialog">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="margin-right: 6px">
            <line
              x1="12"
              y1="5"
              x2="12"
              y2="19" />
            <line
              x1="5"
              y1="12"
              x2="19"
              y2="12" />
          </svg>
          New Project
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!pending && projects.length === 0"
      class="empty-state">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9ca3af"
        stroke-width="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <p>No projects yet. Create your first one!</p>
    </div>

    <!-- Project Cards Grid -->
    <div
      v-loading="pending"
      class="projects-grid">
      <div
        v-for="project in projects"
        :key="project.id"
        class="project-card">
        <div class="card-top">
          <div class="card-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2">
              <path
                d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <el-dropdown trigger="click">
            <button class="more-btn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor">
                <circle
                  cx="12"
                  cy="5"
                  r="2" />
                <circle
                  cx="12"
                  cy="12"
                  r="2" />
                <circle
                  cx="12"
                  cy="19"
                  r="2" />
              </svg>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openEditDialog(project)">
                  Edit
                </el-dropdown-item>
                <el-dropdown-item
                  divided
                  @click="onDelete(project)">
                  Delete
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <h3 class="card-name">{{ project.name }}</h3>
        <p class="card-desc">{{ project.description || "No description" }}</p>
        <div class="card-footer">
          <span class="card-date">
            Created: {{ formatDate(project.createdAt) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? 'Edit Project' : 'New Project'"
      width="440px"
      destroy-on-close
      class="premium-modal">
      <el-form
        :model="form"
        label-position="top">
        <el-form-item
          label="Project Name"
          required>
          <el-input
            v-model="form.name"
            placeholder="e.g. Mobile App Development" />
        </el-form-item>
        <el-form-item label="Description (Optional)">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="Brief project description..." />
        </el-form-item>

        <button
          type="button"
          class="premium-btn mt-2"
          :class="{ 'is-loading': loading }"
          @click.prevent="onSave">
          <span v-if="loading">Saving...</span>
          <span v-else>
            {{ isEditing ? "Update Project" : "Save Project" }}
          </span>
        </button>
      </el-form>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.admin-projects-page {
  min-height: 100vh;
}

/* ──── Header ──── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;

  .header-left {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .header-icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    color: #6366f1;
    background: #eef2ff;
    border-radius: 10px;
  }

  .header-title {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.3px;
  }
}

.primary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: #6366f1;
  border: none;
  border-radius: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: #4f46e5;
    box-shadow: 0 4px 6px rgb(99 102 241 / 25%);
    transform: translateY(-1px);
  }
}

/* ──── Empty State ──── */
.empty-state {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #9ca3af;
  text-align: center;

  p {
    margin: 0;
    font-size: 15px;
  }
}

/* ──── Projects Grid ──── */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.project-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 16px;
  box-shadow:
    0 1px 3px rgb(0 0 0 / 4%),
    0 1px 2px rgb(0 0 0 / 3%);
  transition: all 0.25s ease;

  &:hover {
    border-color: #e0e7ff;
    box-shadow:
      0 10px 15px -3px rgb(0 0 0 / 6%),
      0 4px 6px -4px rgb(0 0 0 / 4%);
    transform: translateY(-3px);
  }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: #6366f1;
    background: #eef2ff;
    border-radius: 10px;
  }

  .more-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    color: #9ca3af;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 6px;
    transition: all 0.15s ease;

    &:hover {
      color: #4b5563;
      background: #f3f4f6;
    }
  }

  .card-name {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 700;
    color: #111827;
  }

  .card-desc {
    flex: 1;
    margin: 0 0 16px;
    font-size: 13px;
    line-height: 1.5;
    color: #6b7280;
  }

  .card-footer {
    padding-top: 14px;
    border-top: 1px solid #f3f4f6;
  }

  .card-date {
    font-size: 12px;
    color: #9ca3af;
  }
}
</style>
