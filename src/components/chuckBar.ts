//--------------------------------------------------------------------
// Create the WebChucK ChucK Bar
// Start, mic, play, replace, remove
//--------------------------------------------------------------------
import { WebchuckHost } from "./webchuck-host";

// Globals
let webchuckButton: HTMLButtonElement;
//let micButton: HTMLButtonElement;
let playButton: HTMLButtonElement;
//let replaceButton: HTMLButtonElement;
let removeButton: HTMLButtonElement;

export function setupChuckBar(element: HTMLDivElement) {
    // HTML Setup
    element.innerHTML = `
      <div class="h-14 w-full flex justify-start items-center p-2">
        <button id="webchuck" type="button" class="bg-orange text-white mr-2 disabled:opacity-50">Start WebChucK</button>
        <!-- <button id="mic"      type="button" class="bg-white mr-2 disabled:opacity-50" disabled>Mic</button> -->
        <button id="play"     type="button" class="p-0 mr-2 disabled:opacity-50 focus:outline-none" disabled>
            <img src="images/icons/play.svg" alt="Play" class="h-12" draggable="false">
        </button>
        <!-- <button id="replace"  type="button" class="bg-white mr-2 disabled:opacity-50" disabled>Play</button> -->
        <button id="remove"   type="button" class="p-0 mr-2 disabled:opacity-50 focus:outline-none" disabled>
            <img src="images/icons/remove.svg" alt="Remove" class="h-12" draggable="false">
        </button>
    </div>
  `;

    // Button setup
    webchuckButton = document.querySelector<HTMLButtonElement>("#webchuck")!;
    //micButton = document.querySelector<HTMLButtonElement>("#mic")!;
    playButton = document.querySelector<HTMLButtonElement>("#play")!;
    //replaceButton = document.querySelector<HTMLButtonElement>("#replace")!;
    removeButton = document.querySelector<HTMLButtonElement>("#remove")!;

    webchuckButton.addEventListener("click", async () => {
        startWebChuck();
    });

    //micButton!.addEventListener("click", async () => {});

    playButton.addEventListener("click", async () => {
        WebchuckHost.runEditorCode();
    });

    //replaceButton.addEventListener("click", async () => {});

    removeButton.addEventListener("click", async () => {
        WebchuckHost.removeLastCode();
    });
}

//
async function startWebChuck() {
    // Start WebChuck Host
    await WebchuckHost.startChuck(
        webchuckButton
    );

    // Enable Play and Remove buttons
    document.querySelector<HTMLButtonElement>("#play")!.disabled = false;
    document.querySelector<HTMLButtonElement>("#remove")!.disabled = false;
}
