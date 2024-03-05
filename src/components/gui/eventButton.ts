//------------------------------------------------------------
// title: EventButton
// desc:  A canvas button that broadcasts a ChucK event when clicked
//
// author: terry feng
// date:   February 2024
//------------------------------------------------------------

const RADIUS = 12;
const LINE_WIDTH = 8;
const BUTTON_COLOR = "#eee";
const BUTTON_HOVER_COLOR = "#ccc";
const DARK_BUTTON_COLOR = "#333";
const DARK_BUTTON_HOVER_COLOR = "#444";

export default class EventButton {
    public ctx: CanvasRenderingContext2D;
    public x: number;
    public y: number;
    public size: number;
    public eventName: string;
    public isPressed: boolean;
    public isHovered: boolean;
    public isDark: boolean;

    constructor(x: number, y: number, size: number, eventName: string, ctx: CanvasRenderingContext2D, dark: boolean) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.eventName = eventName;
        this.ctx = ctx;
        this.isPressed = false;
        this.isHovered = false;
        this.isDark = dark;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.x + RADIUS, this.y);
        this.ctx.arcTo(this.x + this.size, this.y, this.x + this.size, this.y + this.size, RADIUS);
        this.ctx.arcTo(this.x + this.size, this.y + this.size, this.x, this.y + this.size, RADIUS);
        this.ctx.arcTo(this.x, this.y + this.size, this.x, this.y, RADIUS);
        this.ctx.arcTo(this.x, this.y, this.x + this.size, this.y, RADIUS);
        this.ctx.closePath();

        // Draw the button border
        this.ctx.strokeStyle = this.isDark ? BUTTON_HOVER_COLOR : DARK_BUTTON_HOVER_COLOR;
        this.ctx.lineWidth = LINE_WIDTH;
        this.ctx.stroke();

        // Fill the button
        if (this.isDark) {
            this.ctx.fillStyle = this.isPressed ? DARK_BUTTON_COLOR : this.isHovered ? DARK_BUTTON_HOVER_COLOR : DARK_BUTTON_COLOR;
        } else {
            this.ctx.fillStyle = this.isPressed ? BUTTON_COLOR : this.isHovered ? BUTTON_HOVER_COLOR : BUTTON_COLOR;
        }
        this.ctx.fill();

        // Add the button text
        this.ctx.fillStyle = this.isDark ? "white" : "black";
        this.ctx.font = "1.4rem Arial";
        this.ctx.fillText(this.eventName.substring(0,12), this.x + 10, this.y + this.size - 10);
    }
}
