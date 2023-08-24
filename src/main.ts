import { createEditor, toggleVimMode } from "./components/editor/editor";
import { setupNavbar } from "./components/navbar";
import { setupChuckBar } from "./components/chuckBar";

class Main {

    constructor() {
        setupNavbar();
        setupChuckBar(document.querySelector<HTMLDivElement>("#chuck-bar")!);
        createEditor(document.querySelector<HTMLDivElement>("#editor")!);
    }

    init() {
        // local logic
        document
            .querySelector<HTMLButtonElement>("#vim-toggle")!
            .addEventListener("click", () => {
                toggleVimMode();
            });
    }
}

const main = new Main();
main.init();
