<script setup lang="ts">
import { doc, updateDoc } from "firebase/firestore";
import { useCurrentUser, useDocument, useFirestore } from "vuefire";

const db = useFirestore();
const currentUser = useCurrentUser();

// Fetch user doc from Firestore
const userDocRef = computed(() => {
  if (!currentUser.value?.uid) return null;
  return doc(db, "users", currentUser.value.uid);
});
const { data: userData, pending } = useDocument(userDocRef);

// Edit mode
const isEditing = ref(false);
const saving = ref(false);

const form = reactive({
  email: "",
  name: "",
  phone: "",
});

// Sync form when userData loads
watch(
  () => userData.value,
  (val) => {
    if (val) {
      form.name = val.name || "";
      form.email = val.email || "";
      form.phone = val.phone || "";
    }
  },
  { immediate: true }
);

const cancelEdit = () => {
  if (userData.value) {
    form.name = userData.value.name || "";
    form.email = userData.value.email || "";
    form.phone = userData.value.phone || "";
  }
  isEditing.value = false;
};

const saveProfile = async () => {
  if (!currentUser.value?.uid || !form.name.trim()) return;
  saving.value = true;
  try {
    await updateDoc(doc(db, "users", currentUser.value.uid), {
      name: form.name,
      phone: form.phone || "",
    });
    ElMessage.success("Profile updated successfully");
    isEditing.value = false;
  } catch (err: any) {
    ElMessage.error(err.message || "Error updating profile");
  } finally {
    saving.value = false;
  }
};

const getInitial = (name: string) => {
  return name?.charAt(0)?.toUpperCase() || "?";
};

const memberSince = computed(() => {
  const ca = userData.value?.createdAt;
  if (!ca) return "—";
  const d =
    typeof ca === "string"
      ? new Date(ca)
      : ca.toDate
        ? ca.toDate()
        : new Date(ca);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

// ──── Security (Email & Password) ────
const showSecurityModal = ref(false);
const savingSecurity = ref(false);

const securityForm = reactive({
  confirmPassword: "",
  newEmail: "",
  newPassword: "",
});

const openSecurityModal = () => {
  securityForm.newEmail = userData.value?.email || "";
  securityForm.newPassword = "";
  securityForm.confirmPassword = "";
  showSecurityModal.value = true;
};

const updateCredentials = async () => {
  if (!currentUser.value?.uid) return;

  // Validate
  if (securityForm.newPassword && securityForm.newPassword.length < 6) {
    ElMessage.warning("Password must be at least 6 characters");
    return;
  }
  if (
    securityForm.newPassword &&
    securityForm.newPassword !== securityForm.confirmPassword
  ) {
    ElMessage.warning("Passwords do not match");
    return;
  }

  const hasEmailChange =
    securityForm.newEmail !== (userData.value?.email || "");
  const hasPasswordChange = !!securityForm.newPassword;

  if (!hasEmailChange && !hasPasswordChange) {
    ElMessage.info("No changes detected");
    return;
  }

  savingSecurity.value = true;
  try {
    await $fetch("/api/update-credentials", {
      body: {
        newEmail: hasEmailChange ? securityForm.newEmail : undefined,
        newPassword: hasPasswordChange ? securityForm.newPassword : undefined,
        uid: currentUser.value.uid,
      },
      method: "POST",
    });
    ElMessage.success("Credentials updated successfully");
    showSecurityModal.value = false;
  } catch (err: any) {
    ElMessage.error(
      err.data?.message || err.message || "Error updating credentials"
    );
  } finally {
    savingSecurity.value = false;
  }
};

// Under Development mock
const showUnderDev = () => {
  ElMessage.info("Feature is under development");
};
</script>

<template>
  <div class="profile-page">
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle
              cx="12"
              cy="7"
              r="4" />
          </svg>
        </span>
        <h1 class="header-title">My Profile</h1>
      </div>
    </div>

    <!-- Content -->
    <div
      v-loading="pending"
      class="profile-grid">
      <!-- Left Card: Avatar & Info -->
      <div class="profile-card profile-card--avatar">
        <div class="avatar-circle">
          <span class="avatar-letter">
            {{ getInitial(userData?.name || "") }}
          </span>
        </div>
        <h2 class="profile-name">{{ userData?.name || "—" }}</h2>
        <span
          class="profile-role-badge"
          :class="userData?.role">
          {{ userData?.role === "admin" ? "Admin" : "Employee" }}
        </span>

        <div class="profile-meta">
          <div class="meta-item">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2">
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>{{ userData?.email || "—" }}</span>
          </div>
          <div class="meta-item">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2">
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>{{ userData?.phone || "Not set" }}</span>
          </div>
          <div class="meta-item">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2">
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                ry="2" />
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
            <span>Member since {{ memberSince }}</span>
          </div>
        </div>
      </div>

      <!-- Right Card: Editable Info -->
      <div class="profile-card profile-card--details">
        <div class="details-header">
          <div>
            <h3 class="details-title">Personal Information</h3>
            <p class="details-subtitle">Manage your account details</p>
          </div>
          <button
            v-if="!isEditing"
            class="edit-btn"
            @click="isEditing = true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2">
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label class="info-label">Full Name</label>
            <template v-if="isEditing">
              <el-input
                v-model="form.name"
                placeholder="Your name" />
            </template>
            <p
              v-else
              class="info-value">
              {{ userData?.name || "—" }}
            </p>
          </div>

          <div class="info-item">
            <label class="info-label">Email</label>
            <p class="info-value info-value--readonly">
              {{ userData?.email || "—" }}
            </p>
          </div>

          <div class="info-item">
            <label class="info-label">Phone</label>
            <template v-if="isEditing">
              <el-input
                v-model="form.phone"
                placeholder="+998 90 123 45 67" />
            </template>
            <p
              v-else
              class="info-value">
              {{ userData?.phone || "Not set" }}
            </p>
          </div>

          <div class="info-item">
            <label class="info-label">Role</label>
            <p class="info-value info-value--readonly">
              {{ userData?.role === "admin" ? "Administrator" : "Employee" }}
            </p>
          </div>
        </div>

        <!-- App Preferences (Theme & Lang) -->
        <div
          v-if="!isEditing"
          class="preferences-row">
          <button
            class="pref-btn"
            title="Change Theme"
            @click="showUnderDev">
            <span class="pref-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </span>
            <span class="pref-label">Theme</span>
          </button>

          <button
            class="pref-btn"
            title="Change Language"
            @click="showUnderDev">
            <span class="pref-icon">
              <svg
                width="18"
                height="18"
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
                <line
                  x1="2"
                  y1="12"
                  x2="22"
                  y2="12" />
                <path
                  d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </span>
            <span class="pref-label">Language</span>
          </button>
        </div>

        <!-- Action Buttons (edit mode) -->
        <div
          v-if="isEditing"
          class="details-actions">
          <button
            class="cancel-btn"
            @click="cancelEdit">
            Cancel
          </button>
          <button
            class="save-btn"
            :class="{ 'is-loading': saving }"
            @click="saveProfile">
            <span v-if="saving">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </div>

      <!-- Security Card -->
      <div class="profile-card profile-card--security">
        <div class="details-header">
          <div>
            <h3 class="details-title">Security</h3>
            <p class="details-subtitle">
              Update your email address or password
            </p>
          </div>
          <button
            class="edit-btn"
            @click="openSecurityModal">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2">
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Change
          </button>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label class="info-label">Email</label>
            <p class="info-value">{{ userData?.email || "—" }}</p>
          </div>
          <div class="info-item">
            <label class="info-label">Password</label>
            <p class="info-value">••••••••</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Security Modal -->
    <el-dialog
      v-model="showSecurityModal"
      title="Update Credentials"
      width="440px"
      destroy-on-close
      class="premium-modal">
      <el-form label-position="top">
        <el-form-item label="Email">
          <el-input
            v-model="securityForm.newEmail"
            type="email"
            placeholder="new@email.com" />
        </el-form-item>

        <el-form-item label="New Password">
          <el-input
            v-model="securityForm.newPassword"
            type="password"
            show-password
            placeholder="Leave blank to keep current" />
        </el-form-item>

        <el-form-item
          v-if="securityForm.newPassword"
          label="Confirm Password">
          <el-input
            v-model="securityForm.confirmPassword"
            type="password"
            show-password
            placeholder="Repeat new password" />
        </el-form-item>

        <button
          type="button"
          class="premium-btn mt-2"
          :class="{ 'is-loading': savingSecurity }"
          @click.prevent="updateCredentials">
          <span v-if="savingSecurity">Updating...</span>
          <span v-else>Update Credentials</span>
        </button>
      </el-form>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
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

/* ──── Grid ──── */
.profile-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;

  @media (width <= 768px) {
    grid-template-columns: 1fr;
  }
}

.profile-card--security {
  grid-column: 1 / -1;
}

/* ──── Cards ──── */
.profile-card {
  padding: 32px;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 16px;
  box-shadow:
    0 1px 3px rgb(0 0 0 / 4%),
    0 1px 2px rgb(0 0 0 / 3%);
}

/* ──── Avatar Card ──── */
.profile-card--avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-radius: 50%;
  box-shadow: 0 4px 14px rgb(99 102 241 / 30%);
}

.avatar-letter {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
}

.profile-name {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.profile-role-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  margin-bottom: 24px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  border-radius: 20px;

  &.admin {
    color: #6366f1;
    background: #eef2ff;
  }

  &.employee {
    color: #059669;
    background: #ecfdf5;
  }
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.meta-item {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 13px;
  color: #6b7280;

  svg {
    flex-shrink: 0;
    color: #9ca3af;
  }
}

/* ──── Details Card ──── */
.details-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
}

.details-title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.details-subtitle {
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
}

.edit-btn {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px 16px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #6366f1;
  cursor: pointer;
  background: #eef2ff;
  border: none;
  border-radius: 8px;
  transition: all 0.15s ease;

  &:hover {
    background: #e0e7ff;
  }
}

/* ──── Info Grid ──── */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (width <= 768px) {
    grid-template-columns: 1fr;
  }
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;

  &--readonly {
    color: #6b7280;
  }
}

/* ──── Preferences ──── */
.preferences-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 24px;
  margin-top: 28px;
  border-top: 1px dashed #e5e7eb;
}

.pref-btn {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 18px 10px 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
  cursor: pointer;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  transition: all 0.2s ease;

  .pref-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: #6366f1;
    background: #eef2ff;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  &:hover {
    background: #fff;
    border-color: #e0e7ff;
    box-shadow: 0 4px 12px rgb(99 102 241 / 6%);

    .pref-icon {
      color: #fff;
      background: #6366f1;
      transform: scale(1.05);
    }
  }
}

/* ──── Actions ──── */
.details-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  margin-top: 28px;
  border-top: 1px solid #f3f4f6;
}

.cancel-btn {
  padding: 10px 20px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  background: #f3f4f6;
  border: none;
  border-radius: 10px;
  transition: all 0.15s ease;

  &:hover {
    background: #e5e7eb;
  }
}

.save-btn {
  padding: 10px 24px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: #6366f1;
  border: none;
  border-radius: 10px;
  transition: all 0.15s ease;

  &:hover {
    background: #4f46e5;
    box-shadow: 0 4px 6px rgb(99 102 241 / 25%);
  }

  &.is-loading {
    pointer-events: none;
    opacity: 0.7;
  }
}
</style>
