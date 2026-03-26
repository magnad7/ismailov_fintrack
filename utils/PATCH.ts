export default async function PATCH<T = unknown>(
  url: string,
  body?: unknown,
  query?: Record<string, boolean | null | number | string | undefined>
): Promise<ApiResponse<T>> {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const filteredQuery: Record<string, string> = query
    ? Object.fromEntries(
        Object.entries(query)
          .filter(
            ([, value]) => value !== null && value !== undefined && value !== ""
          )
          .map(([k, v]) => [k, String(v)])
      )
    : {};

  const fullUrl =
    Object.keys(filteredQuery).length > 0
      ? `${config.public.apiBase + url}?${new URLSearchParams(filteredQuery)}`
      : `${config.public.apiBase + url}`;

  try {
    const data = await $fetch<T>(fullUrl, {
      body,
      headers: {
        Authorization: authStore.access ? `Bearer ${authStore.access}` : "",
      },
      method: "PATCH",
    });

    return { data, status: true };
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as any).response
    ) {
      myErorHandler((error as any).response as ErrorResponse);
    }
    throw error;
  }
}
