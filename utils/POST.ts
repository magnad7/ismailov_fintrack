export default async <T = any>(
  url: string,
  body?: FormData | null | Record<string, any>,
  query?: Record<string, string>,
  isMessage?: boolean
): Promise<ApiResponse<T>> => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const fullUrl = query
    ? `${config.public.apiBase + url}?${new URLSearchParams(query)}`
    : `${config.public.apiBase + url}`;

  const headers: Record<string, string> = {
    Authorization: authStore.access ? `Bearer ${authStore.access}` : "",
  };

  // FormData uchun Content-Type o'rnatmaslik kerak —
  // brauzer avtomatik multipart/form-data boundary bilan o'rnatadi
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const { data } = await $fetch<{ data: T }>(fullUrl, {
      body,
      headers,
      method: "POST",
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
