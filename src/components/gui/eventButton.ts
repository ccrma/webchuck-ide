//------------------------------------------------------------
// title: EventButton
// desc:  A canvas button that broadcasts a ChucK event when clicked
//
// author: terry feng
// date:   February 2024
//------------------------------------------------------------

/* eslint-disable indent */

import { theChuck } from "@/host";

const RATIO = window.devicePixelRatio || 1;
const RADIUS = 6 * RATIO;
const LINE_WIDTH = 4 * RATIO;
const PADDING = 5 * RATIO;
const BUTTON_COLOR = "#eee";
const BUTTON_HOVER_COLOR = "#ccc";
const DARK_BUTTON_COLOR = "#333";
const DARK_BUTTON_HOVER_COLOR = "#444";
const FONT = 0.7 * RATIO + "rem Arial";

export default class EventButton {
    public ctx: CanvasRenderingContext2D;
    public x: number;
    public y: number;
    public size: number;
    public eventName: string;
    public isPressed: boolean;
    public isHovered: boolean;
    public isDark: boolean;
    private color: string;
    private hoverColor: string;
    private pressedColor: string;

    constructor(
        x: number,
        y: number,
        size: number,
        eventName: string,
        ctx: CanvasRenderingContext2D,
        dark: boolean
    ) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.eventName = eventName;
        this.ctx = ctx;
        this.isPressed = false;
        this.isHovered = false;
        this.isDark = dark;

        if (this.isDark) {
            this.color = DARK_BUTTON_COLOR;
            this.hoverColor = DARK_BUTTON_HOVER_COLOR;
            this.pressedColor = DARK_BUTTON_COLOR;
        } else {
            this.color = BUTTON_COLOR;
            this.hoverColor = BUTTON_HOVER_COLOR;
            this.pressedColor = BUTTON_COLOR;
        }
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.x + RADIUS, this.y);
        this.ctx.arcTo(
            this.x + this.size,
            this.y,
            this.x + this.size,
            this.y + this.size,
            RADIUS
        );
        this.ctx.arcTo(
            this.x + this.size,
            this.y + this.size,
            this.x,
            this.y + this.size,
            RADIUS
        );
        this.ctx.arcTo(this.x, this.y + this.size, this.x, this.y, RADIUS);
        this.ctx.arcTo(this.x, this.y, this.x + this.size, this.y, RADIUS);
        this.ctx.closePath();

        // Draw the button border
        this.ctx.strokeStyle = this.isDark
            ? BUTTON_HOVER_COLOR
            : DARK_BUTTON_HOVER_COLOR;
        this.ctx.lineWidth = LINE_WIDTH;
        this.ctx.stroke();

        // Fill the button
        this.ctx.fillStyle = this.isPressed
            ? this.pressedColor
            : this.isHovered
            ? this.hoverColor
            : this.color;
        this.ctx.fill();

        // Add the button text
        this.ctx.fillStyle = this.isDark ? "white" : "black";
        this.ctx.font = FONT;
        this.ctx.fillText(
            this.eventName.substring(0, 10),
            this.x + PADDING,
            this.y + this.size - PADDING
        );
    }

    /**
     * Check if the button was pressed
     * @param x position of mouse in canvas
     * @param y position of mouse in canvas
     * @returns if the button was pressed
     */
    checkPressed(x: number, y: number): boolean {
        const dx = x - this.x;
        const dy = y - this.y;
        this.isPressed = dx > 0 && dx < this.size && dy > 0 && dy < this.size;
        if (this.isPressed) {
            theChuck.broadcastEvent(this.eventName);
            console.log("button pressed:", this.eventName);
            return true;
        }
        return false;
    }

    /**
     * Check if the mouse is hovering over the button
     * @param x position of mouse in canvas
     * @param y postion of mouse in canvas
     * @returns whether the mouse is hovering over the button
     */
    checkHover(x: number, y: number): boolean {
        const dx = x - this.x;
        const dy = y - this.y;
        this.isHovered = dx > 0 && dx < this.size && dy > 0 && dy < this.size;
        return this.isHovered;
    }
}
