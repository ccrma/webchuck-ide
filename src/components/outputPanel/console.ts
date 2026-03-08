//----------------------------------------------------------------
// title: Console
// desc:  Ouput console for WebChucK IDE
//        Built with xterm.js
//
// author: terry feng
// date:   September 2023
//----------------------------------------------------------------

import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { LinkProvider } from "xterm-link-provider";
import "@styles/xterm.css";

import { theChuck } from "@/host";

// Define a custom regular expression that matches blob URIs
const blobRegex = /((blob:)?https?:\/\/\S+)/;

export default class Console {
    public static terminal: Terminal;
    public static terminalElement: HTMLDivElement;
    public static fitAddon: FitAddon;
    public static theme: string = "light";

    private static readonly DEFAULT_FONT_SIZE = 15;
    private static readonly MIN_FONT_SIZE = 10;
    private static readonly MAX_FONT_SIZE = 24;

    private static firstPrint: boolean = true;

    constructor() {
        Console.terminal = new Terminal({
            cursorInactiveStyle: "none",
            fontFamily: "monaco, consolas, monospace",
            disableStdin: true,
            fontSize: parseInt(localStorage.getItem("consoleFontSize") || String(Console.DEFAULT_FONT_SIZE)),
            rows: 1, // start with 1 row, then grow
            theme: {
                foreground: Console.theme === "light" ? "#222222" : "#ffffff",
                background: Console.theme === "light" ? "#ffffff" : "#222222",
                selectionBackground:
                    Console.theme === "light" ? "#cccccc55" : "#eeeeee55",
            },
        });

        Console.terminalElement =
            document.querySelector<HTMLDivElement>("#console")!;

        Console.fitAddon = new FitAddon();
        Console.terminal.loadAddon(Console.fitAddon);
        Console.terminal.open(Console.terminalElement);
        Console.fit();

        // Blob Links
        Console.terminal.registerLinkProvider(
            // @ts-expect-error Link Provider relies on a deprecated version of
            // xterm. Either wait for it to be updated, or write a custom
            // Link Provider class - terry 7/16/2024
            new LinkProvider(Console.terminal, blobRegex, (_e, uri) => {
                window.open(uri, "_blank");
            })
        );

        // Resize listener
        window.addEventListener("resize", () => {
            Console.resizeConsole();
        });

        // Font size controls
        document.getElementById("consoleFontDown")?.addEventListener("click", () => Console.changeFontSize(-1));
        document.getElementById("consoleFontUp")?.addEventListener("click", () => Console.changeFontSize(1));

        (window as any).Console = Console;
    }

    /**
     * Resize the console and set the TTY_WIDTH
     */
    static resizeConsole() {
        const container = Console.terminalElement?.parentElement;
        if (!container || container.offsetHeight === 0) return;
        Console.fit();
        theChuck?.setParamInt("TTY_WIDTH", Console.getWidth());
    }

    /**
     * Print text to console
     * @param text text to print
     */
    static print(text: string): void {
        if (Console.firstPrint) {
            Console.terminal.write(text);
            Console.firstPrint = false;
            return;
        }
        Console.terminal.write("\r\n" + text);
    }

    /**
     * Fit the console to the container
     */
    static fit() {
        Console.fitAddon?.fit();
    }

    /**
     * Dark Theme
     */
    static setDarkTheme() {
        Console.theme = "dark";
        if (Console.terminal) {
            Console.terminal.options.theme = {
                background: "#222222",
                foreground: "#ffffff",
                selectionBackground: "#eeeeee55",
            };
        }
    }

    /**
     * Light Theme
     */
    static setLightTheme() {
        Console.theme = "light";
        if (Console.terminal) {
            Console.terminal.options.theme = {
                foreground: "#222222",
                background: "#ffffff",
                selectionBackground: "#cccccc55",
            };
        }
    }

    /**
     * Get the console width
     */
    static getWidth(): number {
        return Console.terminal.cols;
    }

    /**
     * Get height of a single row in px
     */
    static getRowHeight(): number {
        return Console.terminal.rows;
    }

    /**
     * Change the console font size by delta
     */
    static changeFontSize(delta: number) {
        const current = Console.terminal.options.fontSize ?? Console.DEFAULT_FONT_SIZE;
        const next = Math.max(Console.MIN_FONT_SIZE, Math.min(Console.MAX_FONT_SIZE, current + delta));
        Console.terminal.options.fontSize = next;
        localStorage.setItem("consoleFontSize", String(next));
        Console.fit();
    }
}
