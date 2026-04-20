//-----------------------------------------------------------
// title: FpsCounter
// desc:  FPS overlay for ChuGL canvas.
//
// author: ben hoang
// date:   February 2026
//-----------------------------------------------------------

import { engineMode, theChuck } from "@/host";

export default class FpsCounter {
    private static display: HTMLDivElement;
    private static isEnabled: boolean = false;

    constructor() {
        if (engineMode !== "webchugl") return;

        FpsCounter.display =
            document.querySelector<HTMLDivElement>("#fpsCounter")!;

        // Show toggle in View menu
        const toggleItem =
            document.querySelector<HTMLLIElement>("#fpsToggleItem")!;
        toggleItem.classList.remove("hidden");

        // Load state from localStorage
        FpsCounter.isEnabled =
            localStorage.getItem("fpsCounter") === "true";
        const fpsToggle =
            document.querySelector<HTMLButtonElement>("#fpsToggle")!;
        fpsToggle.textContent = FpsCounter.isEnabled ? "FPS: On" : "FPS: Off";
        FpsCounter.setDisplay(FpsCounter.isEnabled);

        fpsToggle.addEventListener("click", () => {
            FpsCounter.isEnabled = !FpsCounter.isEnabled;
            fpsToggle.textContent = FpsCounter.isEnabled
                ? "FPS: On"
                : "FPS: Off";
            localStorage.setItem(
                "fpsCounter",
                String(FpsCounter.isEnabled)
            );
            FpsCounter.setDisplay(FpsCounter.isEnabled);
        });

        // ChuGL updates fps() once per second, so match that rate
        setInterval(() => {
            if (FpsCounter.isEnabled && theChuck) {
                FpsCounter.display.textContent =
                    `${Math.round(theChuck.rawRuntime.fps())} FPS`;
            }
        }, 1000);
    }

    private static setDisplay(visible: boolean): void {
        FpsCounter.display.style.display = visible ? "" : "none";
    }
}
