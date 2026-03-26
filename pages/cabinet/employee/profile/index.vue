<script setup>
const router = useRouter();
const route = useRoute();
const activePage = computed({
  get: () =>
    route.path.includes("settings")
      ? "settings"
      : route.path.includes("signature")
        ? "signature"
        : "/",
  set: (v) =>
    router.push(
      v === "/" ? "/cabinet/employee/profile" : `/cabinet/employee/profile/${v}`
    ),
});
const options = [
  {
    label: "Основная информация",
    value: "/",
  },
  {
    label: "Цифровая подпись",
    value: "signature",
  },
  // {
  //   label: "Настройки",
  //   value: "settings",
  // },
];

const handlerChange = (val) => {
  if (val === "/") router.push("/cabinet/employee/profile");
  if (val === "statistics") router.push("/cabinet/employee/profile/statistics");
  if (val === "settings") router.push("/cabinet/employee/profile/settings");
};
</script>

<template>
  <div class="page">
    <div>
      <div class="d-flex between">
        <div>
          <h1>Профиль пользователя</h1>
          <p class="mb-40 mt-8">Управление личной информацией и настройками</p>
        </div>
      </div>

      <el-segmented
        v-model="activePage"
        :options="options"
        class="mb-30"
        @change="handlerChange">
        <template #default="scope">
          {{ scope.item.label }}
        </template>
      </el-segmented>
      <NuxtPage :suspense="false" />
    </div>
  </div>
</template>
