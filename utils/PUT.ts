export default async <T = unknown>(
  url: string,
  body?: any,
  isMessage?: string
): Promise<ApiResponse<T>> => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  try {
    const data = await $fetch<T>(config.public.apiBase + url, {
      body,
      headers: {
        Authorization: authStore.access ? `Bearer ${authStore.access}` : "",
      },
      method: "PUT",
    });
    return {
      data,
      status: true,
    };
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response
    ) {
      myErorHandler(error.response as ErrorResponse, isMessage);
    }
    throw error;
  }
};
