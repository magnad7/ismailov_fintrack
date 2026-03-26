export default async function GET<T = unknown>(
  url: string,
  query?: QueryParams
): Promise<ApiResponse<T>> {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const filteredQuery: Record<string, unknown> = query
    ? Object.fromEntries(
        Object.entries(query).filter(([, value]) => {
          return (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            (typeof value !== "string" || value.trim() !== "")
          );
        })
      )
    : {};

  const stringQuery: Record<string, string> = Object.fromEntries(
    Object.entries(filteredQuery).map(([key, value]) => {
      return [key, String(value)];
    })
  );

  const hasQuery = Object.keys(stringQuery).length > 0;

  const fullUrl = hasQuery
    ? `${config.public.apiBase + url}?${new URLSearchParams(stringQuery)}`
    : `${config.public.apiBase + url}`;

  try {
    const response = await $fetch<T>(fullUrl, {
      headers: {
        Authorization: authStore.access ? `Bearer ${authStore.access}` : "",
      },
      method: "GET",
    });

    const responseData = response as any;

    return {
      data: responseData.data || responseData || null,
      status: true,
    };
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response?: unknown }).response
    ) {
      myErorHandler((error as { response: ErrorResponse }).response);
    }
    throw error;
  }
}
