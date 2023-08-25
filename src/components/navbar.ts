export class NavBar {
    constructor() {
        this.buildDropdowns();
    }

    buildDropdowns() {
        // File
        let fileButton =
            document.querySelector<HTMLButtonElement>("#fileButton")!;
        let fileDropdown =
            document.querySelector<HTMLDivElement>("#fileDropdown")!;
        let fileBG = document.querySelector<HTMLButtonElement>("#fileBG")!;
        createDropdown(fileButton, fileDropdown, fileBG);

        // Edit
        let editButton =
            document.querySelector<HTMLButtonElement>("#editButton")!;
        let editDropdown =
            document.querySelector<HTMLDivElement>("#editDropdown")!;
        let editBG = document.querySelector<HTMLButtonElement>("#editBG")!;
        createDropdown(editButton, editDropdown, editBG);

        // View
        let viewButton =
            document.querySelector<HTMLButtonElement>("#viewButton")!;
        let viewDropdown =
            document.querySelector<HTMLDivElement>("#viewDropdown")!;
        let viewBG = document.querySelector<HTMLButtonElement>("#viewBG")!;
        createDropdown(viewButton, viewDropdown, viewBG);

        // Examples
        let examplesButton =
            document.querySelector<HTMLButtonElement>("#examplesButton")!;
        let examplesDropdown =
            document.querySelector<HTMLDivElement>("#examplesDropdown")!;
        let examplesBG =
            document.querySelector<HTMLButtonElement>("#examplesBG")!;
        createDropdown(examplesButton, examplesDropdown, examplesBG);

        // Help
        let helpButton =
            document.querySelector<HTMLButtonElement>("#helpButton")!;
        let helpDropdown =
            document.querySelector<HTMLDivElement>("#helpDropdown")!;
        let helpBG = document.querySelector<HTMLButtonElement>("#helpBG")!;
        createDropdown(helpButton, helpDropdown, helpBG);
    }
}

// HELPER FUNCTIONS
function createDropdown(
    button: HTMLButtonElement,
    dropdown: HTMLDivElement,
    bg: HTMLButtonElement
) {
    button?.addEventListener("click", () => {
        dropdown?.classList.toggle("hidden");
        bg?.classList.toggle("hidden");
    });
    bg?.addEventListener("click", () => {
        dropdown?.classList.toggle("hidden");
        bg?.classList.toggle("hidden");
    });
}
