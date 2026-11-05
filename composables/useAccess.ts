import type { AppUser } from "~/composables/useUsers";

const ADMIN_ROLE_IDS = ["1", "2"];
const COMERCIAL_ROLE_IDS = ["3"];
const PRODUCTION_ROLE_IDS = ["4"];
const INSTALLATION_ROLE_IDS = ["5"];

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

    const isProductionUser = (
        appUser?: Pick<AppUser, "roleId"> | null,
    ) => {
        if (!appUser) return false;
        return Boolean(
            appUser.roleId && PRODUCTION_ROLE_IDS.includes(appUser.roleId),
        );
    };

    const getIsProductionUser = async (
        appUser?: Pick<AppUser, "roleId"> | null,
    ) => isProductionUser(appUser);

    const isInstalationUser = (
        appUser?: Pick<AppUser, "roleId"> | null,
    ) => {
        if (!appUser) return false;
        return Boolean(
            appUser.roleId && INSTALLATION_ROLE_IDS.includes(appUser.roleId),
        );
    };

    const getIsInstalationUser = async (
        appUser?: Pick<AppUser, "roleId"> | null,
    ) => isInstalationUser(appUser);

    const canSeeMainDashboard = (
        appUser?: Pick<AppUser, "roleId"> | null,
    ) => {
        if (!appUser) return false;
        return !isProductionUser(appUser) && !isInstalationUser(appUser);
    };

    const getCanSeeMainDashboard = async (
        appUser?: Pick<AppUser, "roleId"> | null,
    ) => canSeeMainDashboard(appUser);

    return {
        isAdminUser,
        getIsAdminUser,
        isComercialUser,
        getIsComercialUser,
        isProductionUser,
        getIsProductionUser,
        isInstalationUser,
        getIsInstalationUser,
        canSeeMainDashboard,
        getCanSeeMainDashboard,
    };
}
