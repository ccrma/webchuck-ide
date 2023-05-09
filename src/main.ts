import "../styles/style.css";
import { WebchuckHost } from "./components/webchuck-host";
import { createEditor, toggleVimMode } from "./components/editor/editor";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>WebChucK IDE</h1>
    <div class="card">
      <button id="webchuck" type="button">Start WebChucK</button>
      <br>
      <br>
      <button id="play" type="button">Play</button>
      <br>
      <br>
      <button id="remove" type="button">Remove</button>
    </div>
  </div>
`;

document
    .querySelector<HTMLButtonElement>("#webchuck")!
    .addEventListener("click", async () => {
        WebchuckHost.startChuck(
            document.querySelector<HTMLButtonElement>("#webchuck")!
        );
    });

document
    .querySelector<HTMLButtonElement>("#play")!
    .addEventListener("click", async () => {
        //WebchuckHost.runCode("SinOsc foo => dac; 1000::ms => now;");
        WebchuckHost.runEditorCode();
    });

document
    .querySelector<HTMLButtonElement>("#remove")!
    .addEventListener("click", async () => {
        WebchuckHost.removeLastCode();
    });

createEditor(document.querySelector<HTMLDivElement>("#editor")!);
document
    .querySelector<HTMLButtonElement>("#vim-toggle")!
    .addEventListener("click", () => {
        toggleVimMode();
    });
