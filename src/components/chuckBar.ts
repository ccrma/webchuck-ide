//--------------------------------------------------------------------
// title: ChuckBar
// desc:  Button interface for communicating with ChucK VM. 
//
//        Left:
//        Start VM, Mic On, Compile and Play, Replace Shred,
//        Remove Shred
//
//        Right:
//        ChucK Time
//        Share Button
//
// author: terry feng
// date:   August 2023
//--------------------------------------------------------------------

import { theChuck, startChuck } from "../host";
import { getEditorCode } from "./editor/editor";

export class ChuckBar {
    public webchuckButton: HTMLButtonElement;
    public micButton: HTMLButtonElement;
    public playButton: HTMLButtonElement;
    public replaceButton: HTMLButtonElement;
    public removeButton: HTMLButtonElement;

    constructor() {
        // Connect all buttons
        this.webchuckButton =
            document.querySelector<HTMLButtonElement>("#webchuckButton")!;
        this.micButton =
            document.querySelector<HTMLButtonElement>("#micButton")!;
        this.playButton =
            document.querySelector<HTMLButtonElement>("#playButton")!;
        this.replaceButton =
            document.querySelector<HTMLButtonElement>("#replaceButton")!;
        this.removeButton =
            document.querySelector<HTMLButtonElement>("#removeButton")!;


        // Add button event listeners
        this.webchuckButton.addEventListener("click", async () => {
            await this.startWebchuck();
        });
        this.micButton.addEventListener("click", async () => {});
        this.playButton.addEventListener("click", async () => {
            ChuckBar.runEditorCode();
            // TODO: Add to shred table...
        });
        this.replaceButton.addEventListener("click", async () => {
            ChuckBar.replaceCode();
            // TODO: Replace shred in shred table...
        });
        this.removeButton.addEventListener("click", async () => {
            ChuckBar.removeCode();
            // TODO: Remove shred from shred table...
        });
    }

    static runEditorCode() {
        theChuck?.runCode(getEditorCode());
    }

    static replaceCode() {
        theChuck?.removeLastCode();
        ChuckBar.runEditorCode();
    }

    static removeCode() {
        theChuck?.removeLastCode();
    }

    async startWebchuck() {
        // Start WebChuck Host
        this.webchuckButton.innerText = "Loading...";
        await startChuck();
        this.webchuckButton.innerText = "WebChucK running...";
        this.webchuckButton.disabled = true;

        // Enable the ChuckBar buttons
        this.micButton.disabled = false;
        this.playButton.disabled = false;
        this.replaceButton.disabled = false;
        this.removeButton.disabled = false;
    }
}
