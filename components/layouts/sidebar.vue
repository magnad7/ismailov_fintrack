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

const isActiveMainMenu = ref(true);

const handleClickMenu = (path, type) => {
  if (type === "main") {
    isActiveMainMenu.value = true;
  } else {
    isActiveMainMenu.value = false;
  }
  router.push(path);
};

const userLogOut = () => {
  authStore.logOut();
};
</script>

<template>
  <el-icon
    class="layout-menu-collapse"
    @click="cookieStore.isOpenMenu = !cookieStore.isOpenMenu">
    <ArrowRightBold />
  </el-icon>

  <!-- <div class="layout-header"></div> -->
  <div class="layout-profile">
    <div class="layout-profile-icon">
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
        class="lucide lucide-user w-4 h-4 text-primary-foreground"
        aria-hidden="true">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle
          cx="12"
          cy="7"
          r="4"></circle>
      </svg>
    </div>
    <div class="layout-profile-info">
      <span>
        <b>{{ authStore.user?.name }}</b>
      </span>
      <br />
      <span>{{ variableStore.roles[authStore.user?.role] }}</span>
    </div>
  </div>

  <el-scrollbar height="100%">
    <el-menu
      class="layout-menu"
      :collapse="cookieStore.isOpenMenu">
      <el-menu-item
        v-for="item in variableStore.list[authStore.role]"
        :key="item.path"
        :index="item.path"
        :class="{ isActive: activeMenu(item.path) }"
        @click="handleClickMenu(item.path, 'main')">
        <el-icon style="margin-right: 12px !important">
          <Svg :name="item.icon" />
        </el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </el-menu>
  </el-scrollbar>
  <div class="layout-footer">
    <el-menu
      class="layout-menu"
      :collapse="cookieStore.isOpenMenu">
      <el-menu-item
        :class="{ isActive: activeMenu(`/cabinet/${authStore.role}/profile`) }"
        :index="`/cabinet/${authStore.role}/profile`"
        @click="handleClickMenu(`/cabinet/${authStore.role}/profile`)">
        <el-icon style="margin-right: 12px !important">
          <Svg name="user" />
        </el-icon>
        <template #title>Профиль</template>
      </el-menu-item>
      <el-menu-item
        :index="`/cabinet/${authStore.role}/logout`"
        @click="userLogOut">
        <el-icon style="margin-right: 12px !important">
          <Svg name="exit" />
        </el-icon>
        <template #title>Выйти</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>
