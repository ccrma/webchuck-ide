//------------------------------------------------------------
// title: EventButton
// desc:  A canvas button that triggers an event when clicked
//
// author: terry feng
// date:   February 2024
//------------------------------------------------------------

const RADIUS = 12;
const LINE_WIDTH = 8;

export default class EventButton {
    public ctx: CanvasRenderingContext2D;
    public x: number;
    public y: number;
    public size: number;
    public eventName: string;
    public isPressed: boolean;
    public isHovered: boolean;

    constructor(x: number, y: number, size: number, eventName: string, ctx: CanvasRenderingContext2D) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.eventName = eventName;
        this.ctx = ctx;
        this.isPressed = false;
        this.isHovered = false;
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
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = LINE_WIDTH;
        this.ctx.stroke();

        // Fill the button
        this.ctx.fillStyle = this.isPressed ? "grey" : this.isHovered ? "lightgrey" : "darkgrey";
        this.ctx.fill();

        // Add the button text
        this.ctx.fillStyle = "white";
        this.ctx.font = "1.4rem Arial";
        this.ctx.fillText(this.eventName, this.x + 20, this.y + 60);
    }
}
