//-----------------------------------------------------------
// title: FullscreenOverlay
// desc:  Fullscreen overlay for expanding visualizer or ChuGL
//        canvas to fill the viewport, with floating toolbar
//        for close and fullscreen controls.
//
// author: ben hoang
// date:   February 2026
//-----------------------------------------------------------

import { visual } from "@/host";

export default class FullscreenOverlay {
    // DOM references
    private static overlay: HTMLDivElement;
    private static contentMount: HTMLDivElement;
    private static toolbar: HTMLDivElement;
    private static expandIcon: SVGElement;
    private static shrinkIcon: SVGElement;

    // State
    private static isOpen: boolean = false;
    private static activeSource: "visualizer" | "canvas" | null = null;
    private static originalParent: HTMLElement | null = null;
    private static reparentedElement: HTMLElement | null = null;

    // Toolbar hidden — hides toolbar entirely
    static toolbarHidden: boolean = false;

    // Mouse idle timer for auto-hiding toolbar
    private static idleTimer: ReturnType<typeof setTimeout> | null = null;
    private static readonly IDLE_TIMEOUT = 3000;

    // Bound event handlers (for clean removal)
    private static boundOnKeyDown: (e: KeyboardEvent) => void;
    private static boundOnMouseMove: (e: MouseEvent) => void;
    private static boundOnResize: () => void;
    private static boundOnFullscreenChange: () => void;

    constructor() {
        // Query DOM elements
        FullscreenOverlay.overlay =
            document.querySelector<HTMLDivElement>("#fullscreenOverlay")!;
        FullscreenOverlay.contentMount =
            document.querySelector<HTMLDivElement>("#fullscreenContent")!;
        FullscreenOverlay.toolbar =
            document.querySelector<HTMLDivElement>("#fullscreenToolbar")!;
        FullscreenOverlay.expandIcon =
            document.querySelector<SVGElement>("#fullscreenExpandIcon")!;
        FullscreenOverlay.shrinkIcon =
            document.querySelector<SVGElement>("#fullscreenShrinkIcon")!;

        const closeButton =
            document.querySelector<HTMLButtonElement>("#fullscreenClose")!;
        const fullscreenButton =
            document.querySelector<HTMLButtonElement>("#fullscreenToggleBtn")!;

        // Load toolbar toggle from localStorage
        FullscreenOverlay.toolbarHidden =
            localStorage.getItem("toolbarHidden") === "true";

        // Bind event handlers
        FullscreenOverlay.boundOnKeyDown =
            FullscreenOverlay.onKeyDown.bind(FullscreenOverlay);
        FullscreenOverlay.boundOnMouseMove =
            FullscreenOverlay.onMouseMove.bind(FullscreenOverlay);
        FullscreenOverlay.boundOnResize =
            FullscreenOverlay.onResize.bind(FullscreenOverlay);
        FullscreenOverlay.boundOnFullscreenChange =
            FullscreenOverlay.onFullscreenChange.bind(FullscreenOverlay);

        // Wire up toolbar buttons
        closeButton.addEventListener("click", () => FullscreenOverlay.close());
        fullscreenButton.addEventListener("click", () =>
            FullscreenOverlay.toggleFullscreen()
        );
    }

    /**
     * Open the overlay with the given source
     */
    static open(source: "visualizer" | "canvas") {
        if (FullscreenOverlay.isOpen) return;

        FullscreenOverlay.activeSource = source;
        FullscreenOverlay.isOpen = true;

        // Determine the element to reparent
        const element =
            source === "visualizer"
                ? document.querySelector<HTMLDivElement>(
                    "#visualizerContainer"
                )!
                : document.querySelector<HTMLDivElement>(
                    "#canvasContainer"
                )!;

        // Save original parent for restoration
        FullscreenOverlay.originalParent = element.parentElement;
        FullscreenOverlay.reparentedElement = element;

        // Reparent into the overlay content area
        FullscreenOverlay.contentMount.appendChild(element);
        element.classList.remove("hidden");

        // Show the overlay
        FullscreenOverlay.overlay.classList.remove("hidden");

        // Toolbar starts hidden
        FullscreenOverlay.toolbar.classList.add("toolbar-hidden");

        // Add global event listeners
        document.addEventListener("keydown", FullscreenOverlay.boundOnKeyDown);
        FullscreenOverlay.overlay.addEventListener(
            "mousemove",
            FullscreenOverlay.boundOnMouseMove
        );
        window.addEventListener("resize", FullscreenOverlay.boundOnResize);
        document.addEventListener(
            "fullscreenchange",
            FullscreenOverlay.boundOnFullscreenChange
        );

        // Trigger resize after reparent (next frame for layout reflow)
        requestAnimationFrame(() => {
            FullscreenOverlay.onResize();
            // Focus the close button for keyboard accessibility
            document
                .querySelector<HTMLButtonElement>("#fullscreenClose")
                ?.focus();
        });
    }

    /**
     * Close the overlay, restoring the canvas to its original parent
     */
    static close() {
        if (!FullscreenOverlay.isOpen) return;

        // Exit browser fullscreen if active
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }

        // Reparent element back to its original location
        if (
            FullscreenOverlay.originalParent &&
            FullscreenOverlay.reparentedElement
        ) {
            FullscreenOverlay.originalParent.appendChild(
                FullscreenOverlay.reparentedElement
            );
        }

        // Hide overlay
        FullscreenOverlay.overlay.classList.add("hidden");

        // Remove global event listeners
        document.removeEventListener(
            "keydown",
            FullscreenOverlay.boundOnKeyDown
        );
        FullscreenOverlay.overlay.removeEventListener(
            "mousemove",
            FullscreenOverlay.boundOnMouseMove
        );
        window.removeEventListener("resize", FullscreenOverlay.boundOnResize);
        document.removeEventListener(
            "fullscreenchange",
            FullscreenOverlay.boundOnFullscreenChange
        );

        // Clear idle timer
        if (FullscreenOverlay.idleTimer) {
            clearTimeout(FullscreenOverlay.idleTimer);
            FullscreenOverlay.idleTimer = null;
        }

        // Reset fullscreen icon state
        FullscreenOverlay.expandIcon.classList.remove("hidden");
        FullscreenOverlay.shrinkIcon.classList.add("hidden");

        // Reset toolbar to hidden (default state)
        FullscreenOverlay.toolbar.classList.add("toolbar-hidden");

        // Reset state
        FullscreenOverlay.isOpen = false;
        FullscreenOverlay.activeSource = null;
        FullscreenOverlay.originalParent = null;
        FullscreenOverlay.reparentedElement = null;

        // Trigger resize on the restored elements
        requestAnimationFrame(() => {
            visual?.resize();
        });
    }

    /**
     * Toggle browser fullscreen on the overlay element
     */
    static toggleFullscreen() {
        if (!document.fullscreenElement) {
            FullscreenOverlay.overlay.requestFullscreen().catch((err) => {
                console.warn("Fullscreen request failed:", err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    private static onKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                FullscreenOverlay.close();
            }
        }
        // Focus trap: keep Tab within the overlay
        if (e.key === "Tab") {
            const focusable =
                FullscreenOverlay.overlay.querySelectorAll<HTMLElement>(
                    "button:not([disabled]), [tabindex]:not([tabindex=\"-1\"])"
                );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    /**
     * Handle mouse movement — show toolbar near bottom edge
     * unless toolbar is hidden
     */
    private static onMouseMove(e: MouseEvent) {
        if (FullscreenOverlay.toolbarHidden) return;

        const threshold = 80; // px from bottom
        const nearBottom = e.clientY >= window.innerHeight - threshold;

        if (nearBottom) {
            FullscreenOverlay.toolbar.classList.remove("toolbar-hidden");
            FullscreenOverlay.resetIdleTimer();
        }
    }

    /**
     * Reset the idle timer for toolbar auto-hide
     */
    private static resetIdleTimer() {
        if (FullscreenOverlay.idleTimer) {
            clearTimeout(FullscreenOverlay.idleTimer);
        }
        FullscreenOverlay.idleTimer = setTimeout(() => {
            FullscreenOverlay.toolbar.classList.add("toolbar-hidden");
        }, FullscreenOverlay.IDLE_TIMEOUT);
    }

    /**
     * Handle viewport/container resize
     */
    private static onResize() {
        if (!FullscreenOverlay.isOpen) return;
        if (FullscreenOverlay.activeSource === "visualizer") {
            visual?.resize();
        }
    }

    /**
     * Handle fullscreenchange events to sync icon state
     */
    private static onFullscreenChange() {
        if (document.fullscreenElement) {
            FullscreenOverlay.expandIcon.classList.add("hidden");
            FullscreenOverlay.shrinkIcon.classList.remove("hidden");
        } else {
            FullscreenOverlay.expandIcon.classList.remove("hidden");
            FullscreenOverlay.shrinkIcon.classList.add("hidden");
        }
        requestAnimationFrame(() => {
            FullscreenOverlay.onResize();
        });
    }

    /**
     * Whether the overlay is currently open
     */
    static get opened(): boolean {
        return FullscreenOverlay.isOpen;
    }
}
