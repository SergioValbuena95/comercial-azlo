import type { AppUser } from "~/composables/useUsers";

const ADMIN_ROLE_IDS = ["1", "2"];

export function useAccess() {
    const isAdminUser = (
        appUser?: Pick<AppUser, "roleId"> | null,
    ) => {
        if (!appUser) return false;
        return Boolean(
            appUser.roleId && ADMIN_ROLE_IDS.includes(appUser.roleId),
        );
    };

    const getIsAdminUser = async (
        appUser?: Pick<AppUser, "roleId"> | null,
    ) => isAdminUser(appUser);

    return {
        isAdminUser,
        getIsAdminUser,
    };
}
