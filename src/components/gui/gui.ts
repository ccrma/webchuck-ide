//---------------------------------------------------------
// title: Auto Generated GUI
// desc:  Auto generate interactive GUI from ChucK code
//        to control global events and floats
//
// author: terry feng (adapted from original code by celeste betancur)
// date:   March 2024
//---------------------------------------------------------

import Editor from "@components/monaco/editor";
import EventButton from "./eventButton";
import FloatSlider from "./floatSlider";
import { getColorScheme } from "@/utils/theme";
import { getGlobalVariables } from "@/utils/chuckPreprocess";

const GUIPanel = document.getElementById("GUIPanel") as HTMLDivElement;

// Constants
const RATIO = window.devicePixelRatio || 1;
console.log("window scale ratio:", RATIO);
const BUTTON_MARGIN = 10 * RATIO;
const BUTTON_SIZE = 70 * RATIO;
const SLIDER_MARGIN = 15 * RATIO;
const SLIDER_HEIGHT = 48 * RATIO;
const SLIDERS_PER_ROW = 2;

/**
 * Auto generated GUI class to control GUI canvas
 * Read ChucK code to generate control buttons and sliders
 * for global Events and floats
 */
export default class GUI {
    public static canvas: HTMLCanvasElement;
    public static ctx: CanvasRenderingContext2D;
    public static sliders: FloatSlider[] = [];
    public static buttons: EventButton[] = [];
    public static sliderWidth: number = 0;
    private static buttonsPerRow: number = 4;
    private static isDark: boolean;
    private static activeSlider: FloatSlider | undefined;

    constructor() {
        GUI.canvas = document.createElement("canvas");
        GUI.ctx = GUI.canvas.getContext("2d")!;
        // Scale the context by the device pixel ratio
        GUI.ctx.scale(RATIO, RATIO);

        GUI.setTheme(getColorScheme() === "dark");
        GUI.canvas.style.position = "absolute";

        GUI.resizeDimensions();
        GUI.generateGUI();

        window.addEventListener("resize", GUI.onResize);
        GUI.canvas.addEventListener("mousedown", GUI.handleMouseDown);
        GUI.canvas.addEventListener("mouseup", GUI.handleMouseUp);
        GUI.canvas.addEventListener("mousemove", GUI.handleMouseHover);

        // Build GUI Panel
        const panel = document.createDocumentFragment();
        panel.appendChild(GUI.canvas);
        GUI.generateGUIButton(panel);
        GUIPanel.appendChild(panel);
    }

    /**
     * Draw the GUI canvas buttons and sliders
     */
    static draw() {
        GUI.ctx.clearRect(0, 0, GUI.canvas.width, GUI.canvas.height);
        GUI.buttons.forEach((button) => {
            button.draw();
        });
        GUI.sliders.forEach((slider) => {
            slider.draw();
        });
    }

    /**
     * Build the GUI from the current editor code
     * Initialize buttons and sliders from global variables
     */
    static generateGUI(sliderValues?: number[]) {
        if (GUI.canvas.width === 0 || GUI.canvas.height === 0) return;

        const globals = getGlobalVariables(Editor.getEditorCode());

        GUI.buttons = [];
        GUI.sliders = [];

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
                GUI.ctx,
                GUI.isDark
            );
            GUI.buttons.push(eventButton);
        }

        const sliderStartPos =
            Math.ceil(GUI.buttons.length / GUI.buttonsPerRow) *
            (BUTTON_SIZE + BUTTON_MARGIN);

        // create a canvas slider for each float
        for (let i = 0; i < globals.float.length; i++) {
            const x =
                (i % SLIDERS_PER_ROW) * (GUI.sliderWidth + SLIDER_MARGIN) +
                SLIDER_MARGIN;
            const y =
                Math.floor(i / SLIDERS_PER_ROW) *
                    (SLIDER_HEIGHT + BUTTON_MARGIN) +
                BUTTON_MARGIN +
                sliderStartPos;
            const floatSlider = new FloatSlider(
                x,
                y,
                GUI.sliderWidth,
                SLIDER_HEIGHT,
                globals.float[i],
                GUI.ctx,
                GUI.isDark,
                sliderValues ? sliderValues[i] : 0
            );
            GUI.sliders.push(floatSlider);
        }

        GUI.draw();
    }

    /**
     * Create a generate GUI FAB button to call generateGUI
     */
    private static generateGUIButton(parent: DocumentFragment) {
        const guiButton = document.createElement("button");
        guiButton.innerHTML = "Generate GUI";
        guiButton.classList.add(
            "button",
            "secondary",
            "border",
            "border-orange",
            "dark:border-white",
            "text-sm",
            "absolute",
            "bottom-2",
            "right-2"
        );
        // detect operating system
        // TODO: factor this out for clean util
        const isWindows = navigator.userAgent.includes("Windows");
        const metaKey = isWindows ? "Ctrl" : "⌘";
        guiButton.title = `Save and Generate GUI [${metaKey} + S]`;

        guiButton.addEventListener("click", () => GUI.generateGUI());
        parent.appendChild(guiButton);
    }

    //------------------------------------------
    // MOUSE EVENT HANDLERS
    //------------------------------------------
    private static handleMouseDown(event: MouseEvent) {
        const rect = GUI.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * RATIO;
        const y = (event.clientY - rect.top) * RATIO;

        GUI.buttons.forEach((button) => button.checkPressed(x, y));

        GUI.activeSlider = GUI.sliders.find((slider) => slider.contains(x, y));
        if (GUI.activeSlider) {
            GUI.activeSlider.updateSliderPosition(x);
        }
        document.addEventListener("mousemove", GUI.handleMouseDownMove);
        document.addEventListener("mouseup", GUI.handleMouseUp);

        GUI.draw();
    }

    private static handleMouseUp() {
        GUI.buttons.forEach((button) => (button.isPressed = false));
        document.removeEventListener("mousemove", GUI.handleMouseDownMove);
        document.removeEventListener("mouseup", GUI.handleMouseUp);
        GUI.activeSlider = undefined;
        GUI.draw();
    }

    private static handleMouseDownMove(event: MouseEvent) {
        const rect = GUI.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * RATIO;
        // const y = (event.clientY - rect.top) * RATIO;

        if (GUI.activeSlider) {
            GUI.activeSlider.updateSliderPosition(x);
        }
        GUI.draw();
    }

    private static handleMouseHover(event: MouseEvent) {
        const rect = GUI.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * RATIO;
        const y = (event.clientY - rect.top) * RATIO;

        let redraw = false;
        for (const button of GUI.buttons) {
            const wasHovering = button.isHovered;
            if (wasHovering != button.checkHover(x, y)) {
                redraw = true;
            }
        }

        if (redraw) {
            GUI.draw();
        }
    }

    //------------------------------------------
    // RESIZE EVENT HANDLERS
    //------------------------------------------
    /**
     * Resize the GUI canvas and recompute buttons/sliders
     */
    private static resizeDimensions() {
        const width = GUIPanel.clientWidth * RATIO;
        const height = GUIPanel.clientHeight * RATIO;
        GUI.canvas.width = width;
        GUI.canvas.height = height;
        GUI.canvas.style.width = GUIPanel.clientWidth + "px";
        GUI.canvas.style.height = GUIPanel.clientHeight + "px";
        GUI.buttonsPerRow = Math.max(
            1,
            Math.floor(width / (BUTTON_SIZE + BUTTON_MARGIN))
        );
        GUI.sliderWidth = Math.floor(
            (width - SLIDER_MARGIN) / SLIDERS_PER_ROW - SLIDER_MARGIN
        );
    }

    /**
     * Handle GUI Panel resize event
     */
    static onResize() {
        const sliderValues = GUI.sliders.map((slider) => slider.value);

        GUI.resizeDimensions();
        GUI.generateGUI(sliderValues);

        GUI.sliders.forEach((slider, i) => (slider.value = sliderValues[i]));
        GUI.draw();
    }

    //------------------------------------------
    // THEME HANDLERS
    //------------------------------------------
    /**
     * Set the GUI theme to dark or light
     * @param isDark dark mode
     */
    static setTheme(isDark: boolean) {
        const sliderValues = GUI.sliders.map((slider) => slider.value);
        GUI.isDark = isDark;
        if (GUI.canvas) {
            GUI.canvas.style.backgroundColor = isDark ? "#222" : "white";
            GUI.generateGUI(sliderValues);
        }
    }
}
(window as any).GUI = GUI;
