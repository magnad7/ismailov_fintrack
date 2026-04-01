<script setup>
import { ArrowRightBold } from "@element-plus/icons-vue";

const variableStore = useVariebleStore();
const authStore = useAuthStore();
const cookieStore = useCookiesStore();
const router = useRouter();
const route = useRoute();

const activeMenu = computed(() => {
  return (path) => route.path.startsWith(path);
});

const handleClickMenu = (path) => {
  router.push(path);
};

const userLogOut = () => {
  authStore.logOut();
};

const getInitial = (name) => {
  return name?.charAt(0)?.toUpperCase() || "?";
};
</script>

<template>
  <!-- Collapse Toggle -->
  <button
    class="sidebar-collapse-btn"
    :class="{ collapsed: cookieStore.isOpenMenu }"
    @click="cookieStore.isOpenMenu = !cookieStore.isOpenMenu">
    <el-icon :size="14">
      <ArrowRightBold />
    </el-icon>
  </button>

  <!-- Profile Section -->
  <div class="sidebar-profile">
    <div class="sidebar-profile__avatar">
      {{ getInitial(authStore.userObj?.name) }}
    </div>
    <div class="sidebar-profile__info">
      <span class="sidebar-profile__name">
        {{ authStore.userObj?.name || "User" }}
      </span>
      <span class="sidebar-profile__role">
        {{ variableStore.roles[authStore.userObj?.role] || "User" }}
      </span>
    </div>
  </div>

  <!-- Navigation Menu -->
  <el-scrollbar height="100%">
    <el-menu
      class="layout-menu"
      :collapse="cookieStore.isOpenMenu">
      <el-menu-item
        v-for="item in variableStore.list[authStore.role]"
        :key="item.path"
        :index="item.path"
        :class="{ 'is-active-item': activeMenu(item.path) }"
        @click="handleClickMenu(item.path)">
        <el-icon style="margin-right: 12px !important">
          <Svg :name="item.icon" />
        </el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </el-menu>
  </el-scrollbar>

  <!-- Footer -->
  <div class="sidebar-footer">
    <el-menu
      class="layout-menu"
      :collapse="cookieStore.isOpenMenu">
      <el-menu-item
        :class="{
          'is-active-item': activeMenu(`/cabinet/${authStore.role}/profile`),
        }"
        :index="`/cabinet/${authStore.role}/profile`"
        @click="handleClickMenu(`/cabinet/${authStore.role}/profile`)">
        <el-icon style="margin-right: 12px !important">
          <Svg name="user" />
        </el-icon>
        <template #title>Profile</template>
      </el-menu-item>
      <el-menu-item
        class="logout-item"
        :index="`/cabinet/${authStore.role}/logout`"
        @click="userLogOut">
        <el-icon style="margin-right: 12px !important">
          <Svg name="exit" />
        </el-icon>
        <template #title>Log Out</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>
