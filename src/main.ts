import "../styles/style.css";
import { createEditor, toggleVimMode } from "./components/editor/editor";
import { setupNavbar } from "./components/navbar";
import { setupChuckBar } from "./components/chuckBar";


setupNavbar(document.querySelector<HTMLDivElement>("#navbar")!);
setupChuckBar(document.querySelector<HTMLDivElement>("#chuck-bar")!);

createEditor(document.querySelector<HTMLDivElement>("#editor")!);
document
    .querySelector<HTMLButtonElement>("#vim-toggle")!
    .addEventListener("click", () => {
        toggleVimMode();
    });
