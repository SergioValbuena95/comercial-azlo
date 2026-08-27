// export const formatDate = (value?: string | null): string => {
//     if (!value) return "N/A";

//     const dateOnly = value.split("T")[0];
//     const [year, month, day] = dateOnly.split("-");

//     if (!year || !month || !day || day.length > 2) {
//         return value;
//     }

//     return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
// };

const COLOMBIA_TIMEZONE = "America/Bogota";

export const formatDate = (
    date: string | Date | null | undefined,
    options?: Intl.DateTimeFormatOptions
): string => {
    if (!date) return "";

    return new Intl.DateTimeFormat("es-CO", {
        timeZone: COLOMBIA_TIMEZONE,
        dateStyle: "medium",
        timeStyle: "short",
        ...options,
    }).format(new Date(date));
};

export const formatDateTime = (
    date: string | Date | null | undefined
): string => {
    if (!date) return "";

    const value =
        typeof date === "string"
            ? new Date(`${date}Z`)
            : date;

    return new Intl.DateTimeFormat("es-CO", {
        timeZone: COLOMBIA_TIMEZONE,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(value);
};

export const formatDateOnly = (
    date: string | Date | null | undefined
): string => {
    if (!date) return "";

    return new Intl.DateTimeFormat("es-CO", {
        timeZone: COLOMBIA_TIMEZONE,
        dateStyle: "medium",
    }).format(new Date(date));
};

export const formatTime = (
    date: string | Date | null | undefined
): string => {
    if (!date) return "";

    return new Intl.DateTimeFormat("es-CO", {
        timeZone: COLOMBIA_TIMEZONE,
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
};