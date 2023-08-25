import { createEditor, toggleVimMode } from "./components/editor/editor";
import { NavBar } from "./components/navbar";
import { setupChuckBar } from "./components/chuckBar";

class Main {
    constructor() {
        new NavBar();
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
