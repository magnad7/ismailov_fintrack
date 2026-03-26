export const useCookiesStore = defineStore(
  "cookiesStore",
  () => {
    const isOpenMenu = ref<boolean>(false);
    return {
      isOpenMenu,
    };
  },
  {
    persist: true,
  }
);
