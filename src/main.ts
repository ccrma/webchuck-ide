import { createEditor, toggleVimMode } from "./components/editor/editor";
import { NavBar } from "./components/navbar";
import { ChuckBar } from "./components/chuckBar";

class Main {
    constructor() {
        new NavBar();
        new ChuckBar();
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
