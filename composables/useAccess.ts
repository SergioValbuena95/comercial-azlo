import type { AppUser } from "~/composables/useUsers";

const ADMIN_ROLE_IDS = ["1", "2"];
const COMERCIAL_ROLE_IDS = ["3"];

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

    const isComercialUser = (
        appUser?: Pick<AppUser, "roleId"> | null,
    ) => {
        if (!appUser) return false;
        return Boolean(
            appUser.roleId && COMERCIAL_ROLE_IDS.includes(appUser.roleId),
        );
    };

    const getIsComercialUser = async (
        appUser?: Pick<AppUser, "roleId"> | null,
    ) => isComercialUser(appUser);

    return {
        isAdminUser,
        getIsAdminUser,
        isComercialUser,
        getIsComercialUser,
    };
}
