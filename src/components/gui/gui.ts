import Editor from "@components/monaco/editor";
import EventButton from "./eventButton";
import FloatSlider from "./floatSlider";
import { theChuck } from "@/host";
import { getColorScheme } from "@/utils/theme";
import { chuckPreprocess } from "@/utils/chuckPreprocess";

const GUIPanel = document.getElementById("GUIPanel") as HTMLDivElement;

// Constants
const RATIO = window.devicePixelRatio || 1;
console.log("window scale ratio:", RATIO);
const BUTTON_MARGIN = 20; 
const BUTTON_SIZE = 140; 
const SLIDERS_PER_ROW = 2;

export default class GUI {
    public static canvas: HTMLCanvasElement;
    public static ctx: CanvasRenderingContext2D;

    public static sliders: FloatSlider[] = [];
    public static buttons: EventButton[] = [];
    public static sliderWidth: number = 0;
    private static buttonsPerRow: number;
    private static isDark: boolean;

    constructor() {
        GUI.canvas = document.createElement("canvas");
        GUI.ctx = GUI.canvas.getContext("2d")!;
        // Scale the context by the device pixel ratio
        GUI.ctx.scale(RATIO, RATIO);

        GUI.setTheme(getColorScheme() === "dark");
        GUI.canvas.style.position = "absolute";

        console.log(GUI.canvas.width, GUI.canvas.height);
        GUI.resizeDimensions();
        GUI.generateGUI();

        window.addEventListener("resize", GUI.onResize);
        GUI.canvas.addEventListener("mousedown", GUI.handleMouseDown);
        GUI.canvas.addEventListener("mouseup", GUI.handleMouseUp);
        GUI.canvas.addEventListener("mousemove", GUI.handleMouseHover);

        GUIPanel.appendChild(GUI.canvas);
        GUI.generateGUIButton();
    }

    static draw() {
        GUI.ctx.clearRect(0, 0, GUI.canvas.width, GUI.canvas.height);
        GUI.buttons.forEach((button) => {
            button.draw();
        });
        GUI.sliders.forEach((slider) => {
            slider.draw();
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
    static generateGUI() {
        console.log(GUI.canvas.width, GUI.canvas.height);
        if (GUI.canvas.width == 0 || GUI.canvas.height == 0) return;

        // clear the canvas
        GUI.ctx.clearRect(0, 0, GUI.canvas.width, GUI.canvas.height);

        const globals = chuckPreprocess(Editor.getEditorCode());
        if (globals.Event.length == 0 && globals.float.length == 0) return;

        GUI.buttons = [];
        GUI.sliders = [];

        let xPos = 0;
        let yPos = 0;

        // create a canvas button for each event
        for (let i = 0; i < globals.Event.length; i++) {
            xPos =
                (i % GUI.buttonsPerRow) * (BUTTON_SIZE + BUTTON_MARGIN) +
                BUTTON_MARGIN;
            yPos =
                Math.floor(i / GUI.buttonsPerRow) *
                    (BUTTON_SIZE + BUTTON_MARGIN) +
                BUTTON_MARGIN;
            const eventButton = new EventButton(
                xPos,
                yPos,
                BUTTON_SIZE,
                globals.Event[i],
                GUI.ctx,
                GUI.isDark
            );
            GUI.buttons.push(eventButton);
        }

        const previousButtonRowPos = yPos + BUTTON_SIZE;

        // create a canvas slider for each float
        for (let i = 0; i < globals.float.length; i++) {
            const x =
                (i % SLIDERS_PER_ROW) * (GUI.sliderWidth + BUTTON_MARGIN) +
                BUTTON_MARGIN;
            const y =
                Math.floor(i / SLIDERS_PER_ROW) *
                    (BUTTON_SIZE + BUTTON_MARGIN) +
                BUTTON_MARGIN + previousButtonRowPos;
            console.log(i);
            const floatSlider = new FloatSlider(
                x,
                y,
                GUI.sliderWidth,
                BUTTON_SIZE,
                globals.float[i],
                GUI.ctx,
                GUI.isDark
            );
            GUI.sliders.push(floatSlider);
        }

        GUI.draw();
    }

    // Add a build GUI round button with a refresh icon in the bottom right corner
    // make it a Floating action butotn with a refresh icon
    static generateGUIButton() {
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
        // TODO: factor this out for clean util
        const isWindows = navigator.platform.indexOf("Win") !== -1;
        const metaKey = isWindows ? "Ctrl" : "⌘";
        guiButton.title = `Save and Generate GUI [${metaKey} + S]`;

        guiButton.addEventListener("click", GUI.generateGUI);
        GUIPanel.appendChild(guiButton);
    }

    static resizeDimensions() {
        GUI.canvas.width = GUIPanel.clientWidth * RATIO;
        GUI.canvas.height = GUIPanel.clientHeight * RATIO;
        GUI.canvas.style.width = GUIPanel.clientWidth + "px";
        GUI.canvas.style.height = GUIPanel.clientHeight + "px";
        GUI.buttonsPerRow = Math.max(1, Math.floor(
            GUI.canvas.width / (BUTTON_SIZE + BUTTON_MARGIN)
        ));
        GUI.sliderWidth = Math.floor(
            (GUI.canvas.width - BUTTON_MARGIN) / SLIDERS_PER_ROW - BUTTON_MARGIN
        );
    }

    static onResize() {
        GUI.resizeDimensions();
        GUI.generateGUI();
    }

    static setTheme(isDark: boolean) {
        GUI.isDark = isDark;
        if (GUI.canvas) {
            GUI.canvas.style.backgroundColor = isDark ? "#222" : "white";
            GUI.generateGUI();
        }
    }
}

function isPressed(eventButton: EventButton, x: number, y: number) {
    const scaledX = x * RATIO;
    const scaledY = y * RATIO;
    if (
        scaledX > eventButton.x &&
        scaledX < eventButton.y + eventButton.size &&
        scaledY > eventButton.y &&
        scaledY < eventButton.y + eventButton.size
    ) {
        return true;
    }
    return false;
}
