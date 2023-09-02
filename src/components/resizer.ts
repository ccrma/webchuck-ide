export default class Resizer {
    // Constants
    readonly SPLITTER_THICKNESS: number = 2;
    readonly MIN_SIZE: number = 20;
    // Members
    private isHorizDrag: boolean;
    private split: HTMLElement;
    private splitContainer: HTMLElement;
    // Function References
    private onDragHandler: (event: MouseEvent) => void;
    private onEndDragHandler: (event: MouseEvent) => void;

    constructor(split: HTMLElement, isHorizDrag: boolean) {
        this.split = split;
        this.isHorizDrag = isHorizDrag;
        this.splitContainer = split.parentNode as HTMLElement;

        // Function References
        this.onDragHandler = this.onDrag.bind(this); // to preserve the 'this' context
        this.onEndDragHandler = this.onEndDrag.bind(this);

        this.split.addEventListener("mousedown", () => {
            this.onStartDrag();
        });
    }

    onStartDrag() {
        this.splitContainer.addEventListener("mousemove", this.onDragHandler);
        this.splitContainer.addEventListener(
            "mouseleave",
            this.onEndDragHandler
        );
        this.splitContainer.addEventListener("mouseup", this.onEndDragHandler);
    }

    onDrag(event: MouseEvent) {
        // get adjacent elements, whether horizontal or vertical
        const topLeft: HTMLElement = this.split
            .previousElementSibling as HTMLElement;
        const bottomRight: HTMLElement = this.split
            .nextElementSibling as HTMLElement;

        // Get container offset
        const topLeftStart: number = this.isHorizDrag
            ? topLeft.getBoundingClientRect().left
            : topLeft.getBoundingClientRect().top;
        const bottomRightEnd: number = this.isHorizDrag
            ? bottomRight.getBoundingClientRect().right
            : bottomRight.getBoundingClientRect().bottom;

        let newTopLeftSize: number = this.isHorizDrag
            ? event.clientX - topLeftStart
            : event.clientY - topLeftStart;

        // Check if the new sizes are too small
        if (newTopLeftSize < this.MIN_SIZE) {
            newTopLeftSize = this.MIN_SIZE;
        }

        let newBotRightSize: number =
            bottomRightEnd -
            topLeftStart -
            this.SPLITTER_THICKNESS -
            newTopLeftSize;

        // Check if the new sizes are too small
        if (newBotRightSize < this.MIN_SIZE) {
            newBotRightSize = this.MIN_SIZE;
            newTopLeftSize =
                bottomRightEnd -
                topLeftStart -
                this.SPLITTER_THICKNESS -
                newBotRightSize;
        }

        // VERTICAL DRAG EVENT, easy calculation
        if (!this.isHorizDrag) {
            // convert to percentages
            let newTopPercent: number =
                (newTopLeftSize / (bottomRightEnd - topLeftStart)) * 100;
            let newBottomPercent: number =
                (newBotRightSize / (bottomRightEnd - topLeftStart)) * 100;
            // These heights are used to create a new style element for the widths
            const rows: string[] = [
                `${newTopPercent}%`,
                `${this.SPLITTER_THICKNESS}px`,
                `${newBottomPercent}%`,
            ];
            this.splitContainer.style.gridTemplateRows = rows.join(" ");
        } else {
            // HORIZONTAL DRAG EVENT, more complicated calculation
            // Figure out which column is not being resized
            let leftID = this.split.previousElementSibling!.id;
            let colWidths: [number, number, number] = sortColWidths(
                leftID,
                newTopLeftSize,
                newBotRightSize
            );
            let colPercents: number[] = colWidths.map((width) => {
                return (width / this.splitContainer.clientWidth) * 100;
            });
            let cols: string[] = [
                `${colPercents[0]}%`,
                `${this.SPLITTER_THICKNESS}px`,
                `${colPercents[1]}%`,
                `${this.SPLITTER_THICKNESS}px`,
                `${colPercents[2]}%`,
            ];
            this.splitContainer.style.gridTemplateColumns = cols.join(" ");
        }
    }

    onEndDrag() {
        // remove all event listeners
        this.splitContainer.removeEventListener(
            "mousemove",
            this.onDragHandler
        );
        this.splitContainer.removeEventListener(
            "mouseup",
            this.onEndDragHandler
        );
    }
}

function sortColWidths(
    leftID: string,
    newLeftTopSize: number,
    newRightBotSize: number
): [number, number, number] {
    if (leftID === "app-left") {
        return [
            newLeftTopSize,
            newRightBotSize,
            document.getElementById("app-right")!.clientWidth,
        ];
    } else if (leftID === "app-middle") {
        return [
            document.getElementById("app-left")!.clientWidth,
            newLeftTopSize,
            newRightBotSize,
        ];
    }

    // this would be an error
    return [0, 0, 0];
}
