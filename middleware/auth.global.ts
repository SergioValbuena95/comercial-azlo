export default defineNuxtRouteMiddleware(async (to) => {
    if (import.meta.server) return;

    const { user, initAuth } = useAuth();
    await initAuth();

    const isLoginPage = to.path === "/login";
    const isPasswordSetup =
        to.query.setup_password === "1" ||
        to.hash?.includes("type=invite") ||
        to.hash?.includes("type=recovery");

    if (!user.value && !isLoginPage) {
        return navigateTo("/login");
    }

    if (user.value && isLoginPage && !isPasswordSetup) {
        return navigateTo("/");
    }
});
