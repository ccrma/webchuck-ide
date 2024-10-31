//-----------------------------------------------------------------------------
// title: Input Monitor
// desc:  Log events from HID, sensors, etc. to the IDE.
//
// author: terry feng
// date:   October 2024
//-----------------------------------------------------------------------------

export default class InputMonitor {
    public monitor: HTMLDivElement;
    public max_elements: number;
    public active: boolean;

    constructor(div: HTMLDivElement, max_elements: number = 5, active = false) {
        this.monitor = div;
        this.max_elements = max_elements;
        this.active = active;
    }

    /**
     * Log HID events to IDE
     * @param message HID event message to log
     */
    logEvent(message: string) {
        const logEntry = document.createElement("pre");
        logEntry.className = "logMsg";
        logEntry.textContent = message;

        this.monitor.appendChild(logEntry);

        // Remove excess entries
        while (this.monitor.children.length > this.max_elements) {
            this.monitor.removeChild(this.monitor.children[0]);
        }

        // Trigger a reflow to enable CSS transition
        logEntry.offsetWidth;

        // Add fade-out class after a short delay
        setTimeout(() => {
            logEntry.classList.add("fade-out");
        }, 1500);
    }

    setActive(active: boolean) {
        this.monitor.style.opacity = active ? "1" : "0.5";
        this.active = active;
    }
}
