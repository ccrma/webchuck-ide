/**
 * Whether the viewport matches the mobile breakpoint (max-width: 640px).
 * This matches the CSS media queries in index.css.
 */
export const isMobile = () =>
    window.matchMedia("(max-width: 640px)").matches;
