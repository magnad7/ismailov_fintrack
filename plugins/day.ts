import dayjs from "dayjs";
export default defineNuxtPlugin(() => {
  (dayjs as any).Ls.en.weekStart = 1;
});
