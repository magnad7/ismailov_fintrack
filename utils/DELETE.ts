export default async <T = unknown>(
  url: string,
  query?: Record<string, any>
): Promise<ApiResponse<T>> => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();
  const fullUrl = query
    ? `${config.public.apiBase + url}?${new URLSearchParams(query)}`
    : `${config.public.apiBase + url}`;

  try {
    const data = await $fetch<T>(fullUrl, {
      headers: {
        Authorization: authStore.access ? `Bearer ${authStore.access}` : "",
      },
      method: "DELETE",
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
      myErorHandler(error.response as ErrorResponse);
    }
    throw error;
  }
};
