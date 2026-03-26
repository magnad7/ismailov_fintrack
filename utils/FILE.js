export default async (url, query) => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const fullUrl = query
    ? `${config.public.apiBase + url}?${new URLSearchParams(query)}`
    : `${config.public.apiBase + url}`;
  // var fileName = null;
  const data = await $fetch(fullUrl, {
    headers: {
      Authorization: authStore.access ? `Bearer ${authStore.access}` : "",
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Response-Type": "blob",
    },
    method: "GET",
    query,
    // onResponse(context) {
    //   fileName = context.response.headers.get('From')
    // }
  });
  return {
    data,
    // fileName
  };
};
