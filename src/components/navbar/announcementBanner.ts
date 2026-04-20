/**
 * AnnouncementBanner class
 *
 * Used to display announcements to users. Will appear to first-time users
 * or when the announcement version doesn't match localStorage (new announcement).
 *
 * 1. The current banner version is defined in `index.html` <html> tag via
 *    `data-banner-version="X"`.
 * 2. If the localStorage value matches this version, the banner is hidden
 *    synchronously to prevent flashing.
 * 3. Once the user clicks the 'X' button, the banner version is written to
 *    localStorage.
 *
 * To update the announcement banner, increment `data-banner-version` in <html>
 */

import Console from "@/components/outputPanel/console";

export default class AnnouncementBanner {
    public static banner: HTMLDivElement | null;
    public static closeBtn: HTMLButtonElement | null;

    constructor() {
        AnnouncementBanner.banner = document.getElementById(
            "notificationBanner"
        ) as HTMLDivElement | null;
        AnnouncementBanner.closeBtn = document.getElementById(
            "closeNotificationBanner"
        ) as HTMLButtonElement | null;

        const notificationTextEl = document.getElementById("notificationText");
        const notificationLinkEl = document.getElementById(
            "notificationLink"
        ) as HTMLAnchorElement | null;

        if (notificationTextEl && notificationLinkEl) {
            const notificationText =
                notificationTextEl.textContent?.trim() || "";
            const url = notificationLinkEl.href;
            Console.print(`\x1b]8;;${url}\x07${notificationText}\x1b]8;;\x07`);
        }

        if (!AnnouncementBanner.banner || !AnnouncementBanner.closeBtn) return;

        AnnouncementBanner.closeBtn.addEventListener("click", () => {
            const version =
                document.documentElement.getAttribute("data-banner-version") ||
                "1";
            document.documentElement.classList.add("hide-notification-banner");
            localStorage.setItem("hideNotificationBanner", version);
        });
    }
}
