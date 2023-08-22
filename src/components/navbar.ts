/*
<!-- NAVIGATION BAR -->
      <nav class="border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div class="h-10 flex flex-wrap flex-row items-center justify-start mx-auto p-2">
          <!-- Left -->
          <div class="">
            <a href="#" class="flex items-center">
              <img src="/images/icons/chuck-fat.svg" class="mr-3" alt="ChucK Logo" />
            </a>
          </div>
          <div class="w-full md:block md:w-auto" id="navbar-dropdown">
            <ul class="flex flex-col font-medium p-3 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 
                       md:flex-row md:pr-2 md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <a href="#" class="block px-3 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">File</a>
              </li>
              <li>
                <button id="dropdownNavbarLink" data-dropdown-toggle="dropdownNavbar"
                  class="flex items-center justify-between w-full py-8 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 
                         md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:px-2 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
                  Dropdown <svg class="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                  </svg>
                </button>
                <!-- Dropdown menu -->
                <div id="dropdownNavbar" class="z-10 hidden font-normal divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
                    <ul class="py-2 text-sm text-gray-700 dark:text-gray-400" aria-labelledby="dropdownLargeButton">
                      <li>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a>
                      </li>
                      <li>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a>
                      </li>
                      <li>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</a>
                      </li>
                    </ul>
                    <div class="py-1">
                      <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white">Sign out</a>
                    </div>
                </div>
              </li>
              <li>
                <a href="#" class="block px-3 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Edit</a>
              </li>
            </ul>
          </div>

          <!-- Mobile Nav Button-->
          <button data-collapse-toggle="navbar-dropdown" type="button"
            class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-dropdown" aria-expanded="false">
            <span class="sr-only">Open main menu</span>
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>

          <!-- Right -->
          <div></div>
        </div>
      </nav>
      */

export function setupNavbar(element: HTMLDivElement) {
    // build the navbar
    element.innerHTML = `

       <!-- NAVIGATION BAR -->
      <nav class="border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div class="h-10 flex flex-wrap flex-row items-center justify-start mx-auto p-2">
          <!-- Logo -->
          <div class="">
            <a href="#" class="flex items-center">
              <img src="images/icons/chuck-fat.svg" class="mr-3" alt="ChucK Logo" />
            </a>
          </div>
          <!-- Nav Items-->
          <div class="w-full md:block md:w-auto" id="navbar-dropdown">
            <ul class="flex flex-col font-medium p-3 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 
                       md:flex-row md:pr-2 md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <a href="#" class="block px-3 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">File</a>
              </li>
              <li>
                <button id="dropdownNavbarLink" type="button" data-dropdown-toggle="dropdownNavbar"
                  class="flex items-center justify-between w-full py-8 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 
                         md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:px-2 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
                  Dropdown <svg class="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                  </svg>
                </button>
                <!-- Dropdown menu -->
                <div id="dropdownNavbar" class="z-10 hidden font-normal divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
                    <ul class="py-2 text-sm text-gray-700 dark:text-gray-400" aria-labelledby="dropdownLargeButton">
                      <li>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a>
                      </li>
                      <li>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a>
                      </li>
                      <li>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</a>
                      </li>
                    </ul>
                    <div class="py-1">
                      <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white">Sign out</a>
                    </div>
                </div>
              </li>
              <li>
                <a href="#" class="block px-3 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Edit</a>
              </li>
            </ul>
          </div>

          <!-- Mobile Nav Button-->
          <button data-collapse-toggle="navbar-dropdown" type="button"
            class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-dropdown" aria-expanded="false">
            <span class="sr-only">Open main menu</span>
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>

          <!-- Right -->
          <div></div>
        </div>
      </nav>

    `;


    // add event listeners
    document
        .querySelector<HTMLButtonElement>("#dropdownNavbar")!
        .addEventListener("click", async () => {
            console.log("dropdownNavbar clicked");
        });
}
    

