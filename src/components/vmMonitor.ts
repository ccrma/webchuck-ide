//---------------------------------------------------
// title: vmMonitor
// desc:  Monitor for Chuck Virtual Machine
//        Displays VM time, and shred table
//        Include chuckNow class
//
// author: terry feng
// date:   September 2023
//---------------------------------------------------

import { chuckNowCached, sampleRate, theChuck } from "@/host";
import EditorPanelHeader from "./panelHeader/editorPanelHeader";
import { displayFormatTime } from "@/utils/time";

export default class VmMonitor {
    public static vmContainer: HTMLDivElement;
    public static vmTime: HTMLDivElement;
    public static shredTableBody: HTMLTableSectionElement;

    private static shredsToRows: { [key: number]: HTMLTableRowElement } = {};

    constructor() {
        VmMonitor.vmContainer =
            document.querySelector<HTMLDivElement>("#vmMonitor")!;
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
        let newRow = VmMonitor.shredTableBody.insertRow();
        let id = newRow.insertCell(0);
        let name = newRow.insertCell(1);
        let time = newRow.insertCell(2);
        let remove = newRow.insertCell(3);

        VmMonitor.shredsToRows[theShred] = newRow;

        // Shred ID
        id.innerText = theShred.toString();

        // Shred Name
        name.innerText = EditorPanelHeader.getFileName();

        // Shred Time
        // kinda ugly but it works
        (function (cell: HTMLTableCellElement, myShred: number) {
            // get chuck current time | 1.5.0.8
            let startTime: number = chuckNowCached;
            let removed: boolean = false;

            function updateTime() {
                // Get chuck current time
                let now: number = chuckNowCached;
                // Convert to seconds
                let elapsed: number = (now - startTime) / sampleRate;
                // minutes and seconds
                let m = Math.floor(elapsed / 60);
                let s = Math.floor(elapsed % 60);

                // Piggyback off time keeper to remove row
                // if shred is removed
                if (!(myShred in VmMonitor.shredsToRows)) {
                    removed = true;
                }

                // Check if shred active, if not, remove row
                theChuck?.isShredActive(myShred).then((active) => {
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
        let removeButton = document.createElement("input");
        removeButton.setAttribute("type", "image");
        removeButton.setAttribute("src", "img/remove.svg");
        removeButton.classList.add("removeButton");
        removeButton.setAttribute("alt", "remove button");
        remove.appendChild(removeButton);

        remove.addEventListener("click", () => {
            theChuck?.removeShred(theShred).then(
                // Success
                () => {},
                // Failure, do nothing
                () => {}
            );
        });
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
        }
    }
}

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
    static updateChuckNow(timeString: string) {
        if (ChuckNow.isDisplay) {
            ChuckNow.chuckNowTime.innerText = timeString;
        }
    }

    static toggleDisplay() {
        this.setDisplay(!ChuckNow.isDisplay);
    }

    static setDisplay(isDisplay: boolean) {
        if (isDisplay) {
            // On
            ChuckNow.chuckNowToggle.innerText = "ChucK Time: On";
            ChuckNow.chuckNowStatus.style.display = "block";
            ChuckNow.isDisplay = localStorage["chuckNow"] = true;
        } else {
            ChuckNow.chuckNowToggle.innerText = "ChucK Time: Off";
            ChuckNow.chuckNowStatus.style.display = "none";
            ChuckNow.isDisplay = localStorage["chuckNow"] = false;
        }
    }
}
