/* Dropdown Element */
// <li>
//   <button id="vimToggle" type="button" class="block w-full text-left font-medium px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 dark:hover:text-light">CONTENTS</button>
// </li>

/**
 * Dropdown Element class
 * @class DropdownElement
 */
export default class DropdownElement {
    constructor(
        parent: HTMLUListElement,
        content: string,
        callback: () => void
    ) {
        // create element
        const dropdownElement = document.createElement("li");
        dropdownElement.classList.add(
            "block",
            "w-full",
            "text-left",
            "font-medium",
            "px-4",
            "py-2",
            "hover:bg-gray-50",
            "dark:hover:bg-gray-600",
            "dark:hover:text-light"
        );
        dropdownElement.innerHTML = content;

        // add event listener
        dropdownElement.addEventListener("click", () => {
            callback();
        });

        parent.appendChild(dropdownElement);
    }
}
