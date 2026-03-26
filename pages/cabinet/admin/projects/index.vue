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
      // Update
      await updateDoc(doc(db, "projects", editingId.value), {
        description: form.value.description,
        name: form.value.name,
      });
      ElMessage.success("Loyiha muvaffaqiyatli yangilandi");
    } else {
      // Create
      await addDoc(projectsRef, {
        createdAt: serverTimestamp(),
        description: form.value.description,
        name: form.value.name,
      });
      ElMessage.success("Yangi loyiha qo'shildi");
    }
    dialogVisible.value = false;
  } catch (err: any) {
    ElMessage.error(err.message || "Xatolik yuz berdi");
  } finally {
    loading.value = false;
  }
};

const onDelete = (project: any) => {
  ElMessageBox.confirm(
    `${project.name} loyihasini o'chirib tashlamoqchimisiz?`,
    "Diqqat",
    {
      cancelButtonText: "Yo'q",
      confirmButtonText: "Ha",
      type: "warning",
    }
  )
    .then(async () => {
      try {
        await deleteDoc(doc(db, "projects", project.id));
        ElMessage.success("Loyiha o'chirildi");
      } catch (error: any) {
        ElMessage.error("O'chirishda xatolik: " + error.message);
      }
    })
    .catch(() => {});
};
</script>

<template>
  <div class="admin-projects p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Loyihalar boshqaruvi</h1>
      <el-button
        type="primary"
        size="large"
        @click="openCreateDialog">
        <el-icon class="mr-2"><Plus /></el-icon>
        Yangi loyiha
      </el-button>
    </div>

    <!-- Empty State -->
    <el-empty
      v-if="!pending && projects.length === 0"
      description="Hozircha loyihalar yo'q" />

    <!-- Project Cards -->
    <el-row
      :gutter="20"
      class="flex-wrap">
      <el-col
        v-for="project in projects"
        :key="project.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        class="mb-4">
        <el-card
          class="project-card h-full"
          shadow="hover">
          <div class="flex flex-col h-full justify-between">
            <div>
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-bold text-gray-800 m-0 leading-tight">
                  {{ project.name }}
                </h3>
                <el-dropdown trigger="click">
                  <el-button
                    class="p-1 border-0"
                    circle>
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="openEditDialog(project)">
                        Tahrirlash
                      </el-dropdown-item>
                      <el-dropdown-item
                        divided
                        class="text-red-500"
                        @click="onDelete(project)">
                        O'chirish
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <p class="text-sm text-gray-500 mb-4 line-clamp-3">
                {{ project.description || "Izohsiz" }}
              </p>
            </div>

            <div
              class="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span class="text-xs text-gray-400">
                Yaratilgan:
                {{
                  project.createdAt?.toDate
                    ? new Date(project.createdAt.toDate()).toLocaleDateString()
                    : "Noma'lum"
                }}
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Create/Edit Modal -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? 'Loyihani tahrirlash' : 'Yangi loyiha'"
      width="400px">
      <el-form
        :model="form"
        label-position="top">
        <el-form-item
          label="Loyiha nomi"
          required>
          <el-input
            v-model="form.name"
            placeholder="Masalan: Web App Qismi" />
        </el-form-item>
        <el-form-item label="Izoh (ixtiyoriy)">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="Loyiha haqida..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="dialogVisible = false">Bekor qilish</el-button>
          <el-button
            type="primary"
            :loading="loading"
            @click="onSave">
            Saqlash
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.project-card {
  border: 1px solid #ebeef5;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 12px 24px rgb(0 0 0 / 8%) !important;
    transform: translateY(-4px);
  }
}
</style>
