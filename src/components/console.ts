//----------------------------------------------------------------
// title: Console
// desc:  Ouput console for WebChucK IDE
//        Built with xterm.js
//
// author: terry feng
// date:   September 2023
//----------------------------------------------------------------

import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "@styles/xterm.css";

import { theChuck } from "@/host";

export default class Console {
    public static terminal: Terminal;
    public static terminalElement: HTMLDivElement;
    public static fitAddon: FitAddon;
    public static theme: string = "light";

    private static firstPrint: boolean = true;

    constructor() {
        Console.terminal = new Terminal({
            cursorInactiveStyle: "none",
            fontFamily: "monaco, consolas, monospace",
            disableStdin: true,
            fontSize: 15,
            rows: 1, // start with 1 row, then grow
            theme: {
                foreground: Console.theme === "light" ? "#222222" : "#ffffff",
                background: Console.theme === "light" ? "#ffffff" : "#222222",
            },
        });

        Console.terminalElement =
            document.querySelector<HTMLDivElement>("#console")!;

        Console.fitAddon = new FitAddon();
        Console.terminal.loadAddon(Console.fitAddon);
        Console.terminal.open(Console.terminalElement);
        Console.fit();

        // Resize listener
        window.addEventListener("resize", () => {
            Console.resizeConsole();
        });

        (window as any).Console = Console;
    }

    /**
     * Resize the console and set the TTY_WIDTH
     */
    static resizeConsole() {
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
}
