import { HID } from "webchuck";
import ButtonToggle from "@/components/toggle/buttonToggle";

// Document elements
const mouseButton =
    document.querySelector<HTMLButtonElement>("#mouseHIDButton")!;
const keyboardButton =
    document.querySelector<HTMLButtonElement>("#keyboardHIDButton")!;
const hidLog = document.querySelector<HTMLDivElement>("#hidLog")!;

export default class HidPanel {
    constructor(hid: HID) {
        new ButtonToggle(
            mouseButton,
            true,
            "Mouse: On",
            "Mouse: Off",
            () => {
                hid.enableMouse();
                document.addEventListener("mousedown", logMouseClick);
                document.addEventListener("mouseup", logMouseClick);
                document.addEventListener("mousemove", logMouseMoveEvent);
                document.addEventListener("wheel", logWheelEvent);
            },
            () => {
                hid.disableMouse();
                document.removeEventListener("mousedown", logMouseClick);
                document.removeEventListener("mouseup", logMouseClick);
                document.removeEventListener("mousemove", logMouseMoveEvent);
                document.removeEventListener("wheel", logWheelEvent);
            }
        );

        new ButtonToggle(
            keyboardButton,
            true,
            "Keyboard: On",
            "Keyboard: Off",
            () => {
                hid.enableKeyboard();
                document.addEventListener("keydown", logKeyEvent);
                document.addEventListener("keyup", logKeyEvent);
            },
            () => {
                hid.disableKeyboard;
                document.removeEventListener("keydown", logKeyEvent);
                document.removeEventListener("keyup", logKeyEvent);
            }
        );

        mouseButton.disabled = false;
        keyboardButton.disabled = false;

        hidLog.style.opacity = "100";
    }
}

//-----------------------------------------------------------
// HELPERS FOR HID LOGGING
//-----------------------------------------------------------
function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function logKeyEvent(event: KeyboardEvent) {
    if (!event.repeat) {
        if (event.type === "keyup") {
            console.log("hi");
            logEvent(`keyup:   ${event.key} (${event.which})`);
        } else {
            logEvent(`${event.type}: ${event.key} (${event.which})`);
        }
    }
}

function logMouseClick(event: MouseEvent) {
    if (event.type === "mouseup") {
        logEvent(`mouseup:   button=${event.which}`);
    } else {
        logEvent(`${event.type}: button=${event.which}`);
    }
}

function logMouseMoveEvent(event: MouseEvent) {
    logEvent(
        `${event.type}: X=${(
            event.clientX / document.documentElement.clientWidth
        ).toFixed(3)}, Y=${(
            event.clientY / document.documentElement.clientHeight
        ).toFixed(3)}`
    );
}

function logWheelEvent(event: WheelEvent) {
    if (event.deltaX !== 0) {
        logEvent(`${event.type}: deltaX=${clamp(event.deltaX, -1, 1)}`);
    }
    if (event.deltaY !== 0) {
        logEvent(`${event.type}: deltaY=${clamp(event.deltaY, -1, 1)}`);
    }
}

/**
 * Log HID events to IDE
 * @param message HID event message to log
 */
function logEvent(message: string) {
    const logEntry = document.createElement("pre");
    logEntry.className = "logEvent";
    logEntry.textContent = message;

    hidLog.appendChild(logEntry);

    // Remove excess entries, keeping only the last 5
    while (hidLog.children.length > 5) {
        hidLog.removeChild(hidLog.children[0]);
    }

    // Trigger a reflow to enable CSS transition
    logEntry.offsetWidth;

    // Add fade-out class after a short delay
    setTimeout(() => {
        logEntry.classList.add("fade-out");
    }, 1500);
}
