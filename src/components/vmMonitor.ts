//---------------------------------------------------
// title: VmMonitor + ChuckNow
// desc:  Monitor for Chuck Virtual Machine
//        Displays ChucK Now VM time, and shred table
//
// author: terry feng
// date:   September 2023
//---------------------------------------------------

import { getChuckNow, sampleRate, theChuck } from "@/host";
import { displayFormatTime, samplesToTimeHMSS } from "@/utils/time";
import Editor from "@/components/editor/monaco/editor";

/**
 * Vm Monitor Class for handling VM time and shred table
 */
export default class VmMonitor {
    public static vmContainer: HTMLDivElement;
    public static shredTableBody: HTMLTableSectionElement;
    private static numShreds: number = 0;

    private static shredsToRows: { [key: number]: HTMLTableRowElement } = {};

    constructor() {
        VmMonitor.vmContainer =
            document.querySelector<HTMLDivElement>("#vmMonitorContainer")!;
        const shredTable =
            document.querySelector<HTMLDivElement>("#shredTable")!;
        VmMonitor.shredTableBody = shredTable.getElementsByTagName("tbody")[0]!;

        new ChuckNow();
    }

    /**
     * Add a single shred row to the shred table
     * @param theShred Shred ID
     */
    static addShredRow(theShred: number) {
        // Check if shred already exists
        if (theShred in VmMonitor.shredsToRows) {
            return;
        }

        // Create new row
        const newRow = VmMonitor.shredTableBody.insertRow();
        const id = newRow.insertCell(0);
        const name = newRow.insertCell(1);
        const time = newRow.insertCell(2);
        const remove = newRow.insertCell(3);

        VmMonitor.shredsToRows[theShred] = newRow;

        // Shred ID
        id.innerText = theShred.toString();

        // Shred Name
        name.innerText = Editor.getFileName();

        // Shred Time
        // kinda ugly but it works
        (function (cell: HTMLTableCellElement, myShred: number) {
            // get chuck current time | 1.5.0.8
            const startTime: number = getChuckNow();
            let removed: boolean = false;

            function updateTime() {
                // Get chuck current time
                const now: number = getChuckNow();
                // Convert to seconds
                const elapsed: number = (now - startTime) / sampleRate;
                // minutes and seconds
                const m = Math.floor(elapsed / 60);
                const s = Math.floor(elapsed % 60);

                // Piggyback off time keeper to remove row
                // if shred is removed
                if (!(myShred in VmMonitor.shredsToRows)) {
                    removed = true;
                }

                // Check if shred active, if not, remove row
                theChuck?.isShredActive(myShred).then((active: number) => {
                    if (!active && !removed) {
                        removed = true;
                        VmMonitor.removeShredRow(myShred);
                        return;
                    }
                });

                // Only update time if shred row still exists
                if (!removed && VmMonitor.shredTableBody.contains(cell)) {
                    cell.innerText = `${displayFormatTime(
                        m
                    )}:${displayFormatTime(s)}`;
                    setTimeout(updateTime, 300);
                }
            }
            updateTime();
        })(time, theShred);

        // Remove button
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.classList.add("removeButton");
        removeButton.setAttribute("aria-label", "Remove Shred");
        removeButton.innerHTML =
            "<svg viewBox=\"5 18 40 14\" fill=\"none\" class=\"w-4 h-4\"><rect x=\"9.89\" y=\"22.67\" width=\"30.52\" height=\"5.23\" fill=\"white\"/></svg>";
        remove.appendChild(removeButton);

        remove.addEventListener("click", () => {
            theChuck?.removeShred(theShred).then(
                // Success
                () => {},
                // Failure, do nothing
                () => {}
            );
        });

        this.numShreds++;
    }

    /**
     * Remove a single shred row from the shred table
     * @param theShred Shred ID
     */
    static removeShredRow(theShred: number) {
        if (theShred in VmMonitor.shredsToRows) {
            VmMonitor.shredsToRows[theShred].parentNode?.removeChild(
                VmMonitor.shredsToRows[theShred]
            );
            delete VmMonitor.shredsToRows[theShred];
            this.numShreds--;
        }
    }

    static getNumShreds(): number {
        return this.numShreds;
    }
}

/**
 * ChuckNow Class for displaying the current time in the VM
 */
export class ChuckNow {
    public static chuckNowToggle: HTMLButtonElement;
    public static chuckNowStatus: HTMLDivElement;
    public static chuckNowTime: HTMLSpanElement;

    private static isDisplay: boolean = false;

    constructor() {
        ChuckNow.chuckNowToggle =
            document.querySelector<HTMLButtonElement>("#chuckNowToggle")!;
        ChuckNow.chuckNowStatus =
            document.querySelector<HTMLDivElement>("#chuckNowStatus")!;
        ChuckNow.chuckNowTime =
            document.querySelector<HTMLSpanElement>("#chuckNowTime")!;

        ChuckNow.isDisplay = localStorage["chuckNow"] === "true";
        ChuckNow.setDisplay(ChuckNow.isDisplay);

        ChuckNow.chuckNowToggle.addEventListener("click", () => {
            ChuckNow.toggleDisplay();
        });
    }

    /**
     * Update the chuckNow time
     */
    static updateChuckNow(samples: number) {
        if (ChuckNow.isDisplay) {
            ChuckNow.chuckNowTime.innerText = samplesToTimeHMSS(
                samples,
                sampleRate
            );
        }
    }

    static toggleDisplay() {
        this.setDisplay(!ChuckNow.isDisplay);
    }

    static setDisplay(isDisplay: boolean) {
        if (isDisplay) {
            // On
            ChuckNow.chuckNowToggle.innerText = "ChucK Time: On";
            ChuckNow.chuckNowStatus.style.display = "flex";
            ChuckNow.isDisplay = localStorage["chuckNow"] = true;
        } else {
            ChuckNow.chuckNowToggle.innerText = "ChucK Time: Off";
            ChuckNow.chuckNowStatus.style.display = "none";
            ChuckNow.isDisplay = localStorage["chuckNow"] = false;
        }
    }
}
