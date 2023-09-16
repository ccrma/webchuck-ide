import EditorPanelHeader from "./header/editorPanelHeader";


export default class VmMonitor {
    public static vmContainer: HTMLDivElement;
    public static vmTime: HTMLDivElement;
    public static shredTableBody: HTMLTableSectionElement;

    private static shredsToRows: { [key: number]: HTMLTableRowElement; } = {};

    constructor() {
        VmMonitor.vmContainer = document.querySelector<HTMLDivElement>("#vmMonitor")!;
        const shredTable = document.querySelector<HTMLDivElement>("#shredTable")!;
        VmMonitor.shredTableBody = shredTable.getElementsByTagName("tbody")[0]!;
    }

    /**
     * Add a single shred row to the shred table
     * @param theShred Shred ID
     */
    addShredRow(theShred: number) {
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
        (function (cell, myShred) {
            let startTime = chuckNowCached;
        });

    }

    /**
     * Remove a single shred row from the shred table
     * @param theShred Shred ID
     */
    removeShredRow(theShred: number) {
        if (theShred in VmMonitor.shredsToRows) {
            VmMonitor.shredsToRows[theShred].parentNode?.removeChild(VmMonitor.shredsToRows[theShred]);
            delete VmMonitor.shredsToRows[theShred];
        }
    }
}
