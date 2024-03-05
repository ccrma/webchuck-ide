//---------------------------------------------------------
// title: FloatSlider
// desc:  A canvas slider that updates a ChucK float when changed
//
// author: terry feng
// date:   February 2024
//---------------------------------------------------------

const TOP_PADDING = 20;

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

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        floatName: string,
        ctx: CanvasRenderingContext2D,
        dark: boolean
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.floatName = floatName;
        this.value = 0;
        this.ctx = ctx;
        this.isPressed = false;
        this.isDark = dark;
    }

    draw() {
        this.ctx.font = "1.4rem Arial";
        // Draw the slider name
        this.ctx.fillStyle = this.isDark ? "#ccc" : "#333";
        this.ctx.fillText(this.floatName, this.x, this.y + TOP_PADDING);
    
        // Draw horizontal slider line (track)
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y + this.height / 2);
        this.ctx.lineTo(this.x + this.width, this.y + this.height / 2);
        this.ctx.strokeStyle = this.isDark ? "#ccc" : "#333";
        this.ctx.stroke();
    
        // Calculate the position of the handle
        const handleX = this.x + this.value * this.width;
        const handleY = this.y + this.height / 2;
    
        // Draw the handle
        this.ctx.beginPath();
        this.ctx.arc(handleX, handleY, this.height / 4, 0, 2 * Math.PI);
        this.ctx.fillStyle = this.isDark ? "#ccc" : "#333";
        this.ctx.fill();
    
        // Draw the slider value
        this.ctx.fillStyle = this.isDark ? "#ccc" : "#333";
        this.ctx.fillText(this.value.toFixed(2), this.x + this.width - (2*TOP_PADDING), this.y + TOP_PADDING);
    }
}
