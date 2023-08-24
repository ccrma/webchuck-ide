let mobileMenu: HTMLDivElement | null;
let mobileMenuButton: HTMLButtonElement | null;

export function setupNavbar() {
    mobileMenu = document.querySelector<HTMLDivElement>("#mobileMenu");
    mobileMenuButton = document.querySelector<HTMLButtonElement>("#mobileMenuButton");

    // Dropdowns

    // add event listeners
    mobileMenuButton?.addEventListener("click", () => {
        if (mobileMenu?.classList.contains("hidden")) {
            mobileMenu.classList.remove("hidden");
        } else {
            mobileMenu?.classList.add("hidden");
        }
    });
}

/*
          <div class="relative">
            <button href="#" class="px-2 py-2 block text-dark font-semibold rounded hover:text-sky-blue-200 transition sm:py-0 sm:mr-1">File</button>
            <div class="absolute left-0 mt-2 py-1 w-48 bg-white rounded-lg shadow-sm">
              <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-sky-blue-200">New</a>
              <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-sky-blue-200">Upload</a>
            </div>
          </div>

          attach state for open/close
          be able to close dropdown by clicking outside
*/
const dropdownTemplate = document.createElement('dropdownTemplate');
dropdownTemplate.innerHTML = `
 
`
