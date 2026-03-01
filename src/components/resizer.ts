import {
    AppLayoutConstants,
    setAppColumnWidths,
    setContainerRowHeights,
} from "@utils/appLayout";
import Editor from "@/components/editor/monaco/editor";
import Console from "@/components/outputPanel/console";
import { visual } from "@/host";
import GUI from "./inputPanel/gui/gui";

/**
 * Resizer class draggable splitters in App (the main section of the IDE)
 * @class Resizer
 * @param split a resizable splitter
 * @param isHorizDrag whether the splitter is horizontal or vertical running
 * @param splitContainer App container
 */
export default class Resizer {
    // Members
    private readonly isHorizDrag: boolean;
    private split: HTMLElement;
    private readonly splitContainer: HTMLElement;

    // Pointer handler references
    private readonly onPointerDragHandler: (event: PointerEvent) => void;
    private readonly onPointerEndHandler: (event: PointerEvent) => void;

    constructor(split: HTMLElement, isHorizDrag: boolean) {
        this.split = split;
        this.isHorizDrag = isHorizDrag;
        this.splitContainer = split.parentNode as HTMLElement;

        this.onPointerDragHandler = (e: PointerEvent) => this.onDrag(e);
        this.onPointerEndHandler = (e: PointerEvent) => {
            this.split.releasePointerCapture(e.pointerId);
            this.split.removeEventListener("pointermove", this.onPointerDragHandler);
            this.split.removeEventListener("pointerup", this.onPointerEndHandler);
            this.deactivate();
        };

        // Pointer events (unified mouse + touch)
        this.split.addEventListener("pointerdown", (e: PointerEvent) => {
            e.preventDefault();
            this.split.setPointerCapture(e.pointerId);
            this.split.addEventListener("pointermove", this.onPointerDragHandler);
            this.split.addEventListener("pointerup", this.onPointerEndHandler);
            this.activate();
        });

        // Prevent native touch scrolling on the splitter
        this.split.style.touchAction = "none";

        // Keyboard support for resizing
        this.split.setAttribute("tabindex", "0");
        this.split.addEventListener("keydown", (e: KeyboardEvent) => {
            const step = 20; // px per keypress
            if (this.isHorizDrag) {
                if (e.key === "ArrowLeft") { e.preventDefault(); this.nudge(-step); }
                if (e.key === "ArrowRight") { e.preventDefault(); this.nudge(step); }
            } else {
                if (e.key === "ArrowUp") { e.preventDefault(); this.nudge(-step); }
                if (e.key === "ArrowDown") { e.preventDefault(); this.nudge(step); }
            }
        });
    }

    /**
     * Nudge the splitter by a given delta (keyboard resizing)
     */
    nudge(delta: number) {
        const rect = this.split.getBoundingClientRect();
        const fakeEvent = {
            clientX: rect.left + rect.width / 2 + (this.isHorizDrag ? delta : 0),
            clientY: rect.top + rect.height / 2 + (!this.isHorizDrag ? delta : 0),
        } as PointerEvent;
        this.onDrag(fakeEvent);
    }

    onDrag(event: PointerEvent) {
        // get adjacent visible elements, whether horizontal or vertical
        // (skip hidden siblings so the resizer works correctly)
        let topLeft = this.split.previousElementSibling as HTMLElement | null;
        while (topLeft && topLeft.classList.contains("hidden")) {
            topLeft = topLeft.previousElementSibling as HTMLElement | null;
        }
        let bottomRight = this.split.nextElementSibling as HTMLElement | null;
        while (bottomRight && bottomRight.classList.contains("hidden")) {
            bottomRight = bottomRight.nextElementSibling as HTMLElement | null;
        }
        if (!topLeft || !bottomRight) return;

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
            const colWidths: [number, number, number] = sortColWidths(
                topLeft.id,
                bottomRight.id,
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

        // Resize the console and visualizer
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
 * Given the left and right element ids, put the sizes into the correct order
 * left width, middle width, right width
 *
 * @param leftID id of the left element being resized
 * @param rightID id of the right element being resized
 * @param newLeftTopSize size of left/top element
 * @param newRightBotSize size of right/bottom element
 * @returns returns sizes corresponding to app left middle and right
 */
function sortColWidths(
    leftID: string,
    rightID: string,
    newLeftTopSize: number,
    newRightBotSize: number
): [number, number, number] {
    if (leftID === "app-left" && rightID === "app-middle") {
        return [
            newLeftTopSize,
            newRightBotSize,
            document.getElementById("app-right")!.clientWidth,
        ];
    } else if (leftID === "app-middle" && rightID === "app-right") {
        return [
            document.getElementById("app-left")!.clientWidth,
            newLeftTopSize,
            newRightBotSize,
        ];
    } else if (leftID === "app-left" && rightID === "app-right") {
        return [newLeftTopSize, 0, newRightBotSize];
    }

    // this would be an error
    return [0, 0, 0];
}
