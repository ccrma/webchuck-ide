/**
 * Initialize the notification banner logic.
 *
 * The banner logic is driven by a versioning system to allow resurfacing
 * the banner in future updates without cluttering localStorage.
 *
 * 1. The current banner version is defined statically in `index.html` via `data-banner-version="1"` on the `<html>` tag.
 * 2. In `index.html` <head>, if the localStorage value matches this version, the banner is hidden synchronously to prevent flashing.
 * 3. Once the user clicks the close button, this function saves the current string version to localStorage.
 *
 * To show a new banner to all users, increment `data-notification-version` in `index.html`.
 */
export function initNotificationBanner() {
    const banner = document.getElementById(
        "notificationBanner"
    ) as HTMLDivElement | null;
    const closeBtn = document.getElementById(
        "closeNotificationBanner"
    ) as HTMLButtonElement | null;

    if (!banner || !closeBtn) return;

    closeBtn.addEventListener("click", () => {
        const version =
            document.documentElement.getAttribute(
                "data-banner-version"
            ) || "1";
        document.documentElement.classList.add("hide-notification-banner");
        localStorage.setItem("hideNotificationBanner", version);
    });
}
