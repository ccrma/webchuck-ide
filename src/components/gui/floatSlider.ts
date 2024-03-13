//---------------------------------------------------------
// title: FloatSlider
// desc:  A canvas slider that updates a ChucK float when changed
//        value is between 0 and 1
//
// author: terry feng
// date:   February 2024
//---------------------------------------------------------

import { theChuck } from "@/host";

const RATIO = window.devicePixelRatio || 1;
const TOP_PADDING = 15 * RATIO;
const RIGHT_PADDING = 10 * RATIO;
const LINE_WIDTH = 3 * RATIO;
const FONT = 0.7 * RATIO + "rem Arial";
const RADIUS_FACTOR = 8;
const LIGHT_COLOR = "#333";
const DARK_COLOR = "#ccc";

export default class FloatSlider {
    public ctx: CanvasRenderingContext2D;
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public floatName: string;
    public value: number;
    public isPressed: boolean;
    public isDark: boolean;
    private color: string;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        floatName: string,
        ctx: CanvasRenderingContext2D,
        dark: boolean,
        value: number = 0
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.floatName = floatName;
        this.ctx = ctx;
        this.isPressed = false;
        this.isDark = dark;
        this.value = value;
        this.color = this.isDark ? DARK_COLOR : LIGHT_COLOR;
    }

    draw() {
        this.ctx.font = FONT;
        // Draw the slider name
        this.ctx.fillStyle = this.color;
        this.ctx.fillText(this.floatName, this.x, this.y + TOP_PADDING);

        // Draw horizontal slider line (track)
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y + this.height / 2);
        this.ctx.lineTo(this.x + this.width, this.y + this.height / 2);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = LINE_WIDTH;
        this.ctx.stroke();

        // Calculate the position of the handle
        const handleX = this.x + this.value * this.width;
        const handleY = this.y + this.height / 2;

        // Draw the handle
        this.ctx.beginPath();
        this.ctx.arc(
            handleX,
            handleY,
            this.height / RADIUS_FACTOR,
            0,
            2 * Math.PI
        );
        // this.ctx.fillStyle = this.isDark ? "#ccc" : "#333"; // same as above
        this.ctx.fill();

        // Draw the slider value
        // this.ctx.fillStyle = this.color;
        this.ctx.fillText(
            this.value.toFixed(2),
            this.x + this.width - 2 * RIGHT_PADDING,
            this.y + TOP_PADDING
        );
    }

    /**
     * Update slider value and position if mouse down is in bounds
     * @param xPos position of mouse in canvas
     * @param yPos position of mouse in canvas
     */
    updateSliderPosition(xPos: number, yPos: number) {
        if (
            xPos > this.x &&
            xPos < this.x + this.width &&
            yPos > this.y &&
            yPos < this.y + this.height
        ) {
            const currValue = (xPos - this.x) / this.width;
            if (currValue != this.value) {
                theChuck.setFloat(this.floatName, this.value);
                this.value = currValue;
            }
        }
    }
}
