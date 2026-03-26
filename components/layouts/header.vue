<script setup>
const router = useRouter();
const authStore = useAuthStore();
const variebleStore = useVariebleStore();
const logOut = () => {
  authStore.logOut();
  router.push("/auth");
  authStore.access = "";
  authStore.role = "";
  authStore.user = "";
};
</script>

<template>
  <div class="layout-header">
    <div class="layout-header-logo">
      <img
        src="/images/logo2.png"
        height="48px"
        alt="" />
    </div>
    <div
      v-if="authStore && authStore.user && variebleStore"
      class="layout-header-profile">
      <div class="layout-header-profile-image">
        <Svg name="user" />
      </div>
      <div class="layout-header-profile-info">
        <h3>
          {{ JSON.parse(authStore.user, null, 2).name }}
        </h3>
        <h4>{{ variebleStore.roles[authStore.role] }}</h4>
      </div>
    </div>
    <div class="layout-header-exit">
      <el-button @click.prevent="logOut">
        <Svg name="exit" />
        Выход
      </el-button>
    </div>
  </div>
</template>
