import {
    AppLayoutConstants,
    setAppColumnWidths,
    setContainerRowHeights,
} from "@utils/appLayout";
import Editor from "@components/monaco/editor";
import Console from "@/components/console";
import { visual } from "@/host";
import GUI from "@components/gui/gui";

/**
 * Resizer class draggable splitters in App (the main section of the IDE)
 * @class Resizer
 * @param split a resizable splitter
 * @param isHorizDrag whether the splitter is horizontal or vertical running
 * @param splitContainer App container
 */
export default class Resizer {
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
            this.activate();
        });
    }

    onStartDrag() {
        this.splitContainer.addEventListener("mousemove", this.onDragHandler);
        // this.splitContainer.addEventListener(
        //     "mouseleave",
        //     this.onEndDragHandler
        // );
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

        // New size for top/left element
        let newTopLeftSize: number = this.isHorizDrag
            ? event.clientX - topLeftStart
            : event.clientY - topLeftStart;

        // Don't get smaller than minimum size
        if (this.isHorizDrag) {
            newTopLeftSize =
                newTopLeftSize < AppLayoutConstants.MIN_SIZE_H
                    ? AppLayoutConstants.MIN_SIZE_H
                    : newTopLeftSize;
        } else {
            newTopLeftSize =
                newTopLeftSize < AppLayoutConstants.MIN_SIZE_V
                    ? AppLayoutConstants.MIN_SIZE_V
                    : newTopLeftSize;
        }

        // Calculate new size for bottom/right element
        let newBotRightSize: number =
            bottomRightEnd -
            topLeftStart -
            AppLayoutConstants.SPLITTER_THICKNESS -
            newTopLeftSize;

        // Don't get smaller than minimum size
        if (this.isHorizDrag) {
            newBotRightSize =
                newBotRightSize < AppLayoutConstants.MIN_SIZE_H
                    ? AppLayoutConstants.MIN_SIZE_H
                    : newBotRightSize;
        } else {
            newBotRightSize =
                newBotRightSize < AppLayoutConstants.MIN_SIZE_V
                    ? AppLayoutConstants.MIN_SIZE_V
                    : newBotRightSize;
        }
        newTopLeftSize =
            bottomRightEnd -
            topLeftStart -
            AppLayoutConstants.SPLITTER_THICKNESS -
            newBotRightSize;

        // VERTICAL DRAG EVENT, easy calculation
        if (!this.isHorizDrag) {
            const isBottomClosed =
                newBotRightSize == AppLayoutConstants.MIN_SIZE_V;
            if (isBottomClosed) {
                setContainerRowHeights(
                    this.splitContainer,
                    -1,
                    `${newBotRightSize}px`
                );
            } else {
                // convert to percentages
                const newTopPercent: number =
                    (newTopLeftSize / (bottomRightEnd - topLeftStart)) * 100;
                const newBottomPercent: number =
                    (newBotRightSize / (bottomRightEnd - topLeftStart)) * 100;
                setContainerRowHeights(
                    this.splitContainer,
                    newTopPercent,
                    newBottomPercent
                );
            }
        } else {
            // HORIZONTAL DRAG EVENT, more complicated calculation
            // Figure out which column is not being resized
            const leftID = this.split.previousElementSibling!.id;
            const colWidths: [number, number, number] = sortColWidths(
                leftID,
                newTopLeftSize,
                newBotRightSize
            );
            const colPercents: number[] = colWidths.map((width) => {
                return (width / this.splitContainer.clientWidth) * 100;
            });

            // Set current column widths in pixels
            setAppColumnWidths(colPercents);
        }

        // Resize Editor and GUI
        if (
            topLeft.id === "editorPanel" ||
            bottomRight.id === "editorPanel" ||
            topLeft.id === "app-middle" ||
            bottomRight.id === "app-middle"
        ) {
            Editor.resizeEditor();
            GUI.onResize();
        }

        // Resize the console
        if (
            topLeft.id === "outputPanel" ||
            bottomRight.id === "outputPanel" ||
            topLeft.id === "app-right" ||
            bottomRight.id === "app-right"
        ) {
            Console.resizeConsole();
            visual?.resize();
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
        this.deactivate();
    }

    deactivate() {
        // Hide orange
        this.split.classList.remove("active");
    }

    activate() {
        // Make orange
        this.split.classList.add("active");
    }
}

//-----------------------------------------------------------
// Helper Functions
//-----------------------------------------------------------

/**
 * Given the left element id, put the sizes into the correct order
 * left width, middle width, right width
 *
 * @param leftID id of the left element
 * @param newLeftTopSize size of left/top element
 * @param newRightBotSize size of right/bottom element
 * @returns returns sizes corresponding to app left middle and right
 */
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
