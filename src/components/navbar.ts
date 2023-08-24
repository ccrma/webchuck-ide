let mobileMenu: HTMLDivElement | null;
let mobileMenuButton: HTMLButtonElement | null;

export function setupNavbar() {
    mobileMenu = document.querySelector<HTMLDivElement>("#mobileMenu");
    mobileMenuButton = document.querySelector<HTMLButtonElement>("#mobileMenuButton");

    // add event listeners
    mobileMenuButton?.addEventListener("click", () => {
        if (mobileMenu?.classList.contains("hidden")) {
            mobileMenu.classList.remove("hidden");
        } else {
            mobileMenu?.classList.add("hidden");
        }
    });
}
