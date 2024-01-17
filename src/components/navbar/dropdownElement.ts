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
        const buttonElement = document.createElement("button");
        dropdownElement.appendChild(buttonElement);

        buttonElement.classList.add(
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
        buttonElement.innerHTML = content;

        // add event listener
        buttonElement.addEventListener("click", () => {
            callback();
        });

        parent.appendChild(dropdownElement);
    }
}
