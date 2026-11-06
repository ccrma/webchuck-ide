//-----------------------------------------------------------
// title: FpsCounter
// desc:  FPS overlay for ChuGL canvas.
//
// author: ben hoang
// date:   February 2026
//-----------------------------------------------------------

import { engineMode, theChuck } from "@/host";
import ChuckBar from "@/components/chuckBar/chuckBar";

export default class FpsCounter {
    private static display: HTMLDivElement;
    private static isEnabled: boolean = false;
    private static intervalId: ReturnType<typeof setInterval> | null = null;

    constructor() {
        if (engineMode !== "webchugl") return;

        FpsCounter.display =
            document.querySelector<HTMLDivElement>("#fpsCounter")!;

        // Show toggle in View menu
        const toggleItem =
            document.querySelector<HTMLLIElement>("#fpsToggleItem")!;
        toggleItem.classList.remove("hidden");

        // Load state from localStorage
        FpsCounter.isEnabled = localStorage.getItem("fpsCounter") === "true";
        const fpsToggle =
            document.querySelector<HTMLButtonElement>("#fpsToggle")!;
        fpsToggle.textContent = FpsCounter.isEnabled ? "FPS: On" : "FPS: Off";
        fpsToggle.setAttribute("aria-checked", String(FpsCounter.isEnabled));
        FpsCounter.setDisplay(FpsCounter.isEnabled);

        fpsToggle.addEventListener("click", () => {
            FpsCounter.isEnabled = !FpsCounter.isEnabled;
            fpsToggle.textContent = FpsCounter.isEnabled
                ? "FPS: On"
                : "FPS: Off";
            localStorage.setItem("fpsCounter", String(FpsCounter.isEnabled));
            fpsToggle.setAttribute(
                "aria-checked",
                String(FpsCounter.isEnabled)
            );
            FpsCounter.setDisplay(FpsCounter.isEnabled);
        });
    }

    private static setDisplay(visible: boolean): void {
        FpsCounter.display.style.display = visible ? "" : "none";
        if (visible && !FpsCounter.intervalId) {
            // ChuGL updates fps() once per second, so match that rate
            FpsCounter.intervalId = setInterval(() => {
                if (ChuckBar.running && theChuck) {
                    FpsCounter.display.textContent = `${Math.round(theChuck.rawRuntime.fps())} FPS`;
                }
            }, 1000);
        } else if (!visible && FpsCounter.intervalId) {
            clearInterval(FpsCounter.intervalId);
            FpsCounter.intervalId = null;
            // Clear so a stale value isn't shown when re-enabled
            FpsCounter.display.textContent = "";
        }
    }
}
