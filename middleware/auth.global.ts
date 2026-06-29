export default defineNuxtRouteMiddleware(async (to) => {
    if (import.meta.server) return;

    const { user, initAuth } = useAuth();
    await initAuth();

    const isLoginPage = to.path === "/login";

    if (!user.value && !isLoginPage) {
        return navigateTo("/login");
    }

    if (user.value && isLoginPage) {
        return navigateTo("/");
    }
});
