export default defineNuxtRouteMiddleware((to) => {
  const store = useAuthStore();
  const role = store.role;
  const access = store.access;
  const languagePrefixes = ["/ru", "/uz", "/en"];
  let fullPath = to.fullPath;

  for (const prefix of languagePrefixes) {
    if (to.fullPath.startsWith(prefix)) {
      fullPath = fullPath.replace(prefix, "");
      break;
    }
  }

  if (!fullPath.startsWith("/cabinet")) {
    return;
  }

  const pathSegments = fullPath.split("/").filter((segment) => segment !== "");
  if (pathSegments.length >= 2) {
    const targetRole = pathSegments[1];

    if (role !== targetRole) {
      return navigateTo("/auth");
    }
  }
  if (!access) {
    return navigateTo("/auth");
  }
});
