import { chuckPreprocess } from "@/utils/chuckPreprocess";
import Editor from "../monaco/editor";
import EventButton from "./eventButton";
import { theChuck } from "@/host";

const GUIPanel = document.getElementById("GUIPanel") as HTMLDivElement;

// Constants
const BUTTON_MARGIN = 20;
const BUTTON_SIZE = 140;
const RATIO = window.devicePixelRatio || 1;

export default class GUI {
    public static canvas: HTMLCanvasElement;
    public static ctx: CanvasRenderingContext2D;

    public static buttons: EventButton[] = [];

    private static buttonsPerRow: number;

    constructor() {
        GUI.canvas = document.createElement("canvas");
        GUI.ctx = GUI.canvas.getContext("2d")!;
        // Scale the context by the device pixel ratio
        GUI.ctx.scale(RATIO, RATIO);

        GUIPanel.appendChild(GUI.canvas);
        GUI.canvas.style.backgroundColor = "white";
        GUI.canvas.style.position = "absolute";

        GUI.buildGUIButton();
        GUI.resizeDimensions();
        GUI.buildGUI();
        window.addEventListener("resize", GUI.onResize);
        GUI.canvas.addEventListener("mousedown", GUI.handleMouseDown);
        GUI.canvas.addEventListener("mouseup", GUI.handleMouseUp);
        GUI.canvas.addEventListener("mousemove", GUI.handleMouseHover);
    }

    static draw() {
        GUI.ctx.clearRect(0, 0, GUI.canvas.width, GUI.canvas.height);
        GUI.buttons.forEach((button) => {
            button.draw();
        });
    }

    static handleMouseDown(event: MouseEvent) {
        const rect = GUI.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        GUI.buttons.forEach((button) => {
            if (isPressed(button, x, y)) {
                button.isPressed = true;
                theChuck.broadcastEvent(button.eventName);
            }
        });
        GUI.draw();
    }

    static handleMouseUp() {
        GUI.buttons.forEach((button) => {
            button.isPressed = false;
        });
        GUI.draw();
    }

    static handleMouseHover(event: MouseEvent) {
        const rect = GUI.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        GUI.buttons.forEach((button) => {
            if (isPressed(button, x, y)) {
                button.isHovered = true;
            } else {
                button.isHovered = false;
            }
        });
        GUI.draw();
    }

    /**
     * Build the GUI from the code
     */
    static buildGUI() {
        const globals = chuckPreprocess(Editor.getEditorCode());
        globals.Event.push("hi");
        if (globals.Event.length == 0 && globals.float.length == 0) return;

        GUI.buttons = [];

        // create a canvas button for each event
        for (let i = 0; i < globals.Event.length; i++) {
            const x =
                (i % GUI.buttonsPerRow) * (BUTTON_SIZE + BUTTON_MARGIN) +
                BUTTON_MARGIN;
            const y =
                Math.floor(i / GUI.buttonsPerRow) *
                    (BUTTON_SIZE + BUTTON_MARGIN) +
                BUTTON_MARGIN;
            const eventButton = new EventButton(
                x,
                y,
                BUTTON_SIZE,
                globals.Event[i],
                GUI.ctx
            );
            GUI.buttons.push(eventButton);
        }
        GUI.draw();
    }

    // Add a build GUI round button with a refresh icon in the bottom right corner
    // make it a Floating action butotn with a refresh icon
    static buildGUIButton() {
        const guiButton = document.createElement("button");
        guiButton.innerHTML = "Generate GUI";
        guiButton.classList.add(
            "button",
            "secondary",
            "border",
            "dark:border-white",
            "absolute",
            "bottom-2",
            "right-2"
        );
        // detect operating system
        const isWindows = navigator.platform.indexOf("Win") !== -1;
        const metaKey = isWindows ? "Ctrl" : "⌘";
        guiButton.title = `Save and Generate GUI [${metaKey} + S]`;
        guiButton.addEventListener("click", GUI.buildGUI);
        GUIPanel.appendChild(guiButton);
    }

    static resizeDimensions() {
        GUI.canvas.width = GUIPanel.clientWidth * RATIO;
        GUI.canvas.height = GUIPanel.clientHeight * RATIO;
        GUI.canvas.style.width = GUIPanel.clientWidth + "px";
        GUI.canvas.style.height = GUIPanel.clientHeight + "px";
        GUI.buttonsPerRow = Math.floor(
            GUI.canvas.width / (BUTTON_SIZE + BUTTON_MARGIN)
        );
    }

    static onResize() {
        GUI.resizeDimensions();
        GUI.buildGUI();
    }
}

function isPressed(eventButton: EventButton, x: number, y: number) {
    if (
        x > eventButton.x &&
        x < eventButton.x + eventButton.size &&
        y > eventButton.y &&
        y < eventButton.y + eventButton.size
    ) {
        return true;
    }
    return false;
}
