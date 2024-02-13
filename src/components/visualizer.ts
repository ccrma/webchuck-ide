//--------------------------------------------------
// title: visualizer
// desc:  audio visualizer for webchuck output
//        uses web audio api, WebAnalyzerNode
// author: terry feng (original from celeste betancur)
// date:   November 2023
//--------------------------------------------------

import { getColorScheme } from "@/utils/theme";

const MIN_DBFS: number = -120;

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function freqHeightScale(dbfs: number, height: number): number {
    const value: number = clamp(dbfs, MIN_DBFS, 0); // -120 to 0
    const percent: number = value / MIN_DBFS; // 0.0 to 1.0
    return percent * height; // 0.0 to height (downward)
}

// light theme
const waveformColorLight = "#333";
const spectrumColorLight = "#f83";
const spectrumFillLight = "#FFE5C4";
// dark theme
const waveformColorDark = "#eee";
const spectrumColorDark = "#f83";
const spectrumFillDark = "#d2691e";

export default class Visualizer {
    public analyserNode: AnalyserNode;
    public canvas: HTMLCanvasElement;

    private context2D: CanvasRenderingContext2D;
    private waveformData: Float32Array;
    private frequencyData: Float32Array;
    private running: boolean = false;

    private waveformColor: string = waveformColorLight;
    private spectrumColor: string = spectrumColorLight;
    private spectrumFill: string = spectrumFillLight;

    constructor(canvas: HTMLCanvasElement, analyserNode: AnalyserNode) {
        const visualizerDefaultOptions = {
            frameSize: 2048,
            drawWaveform: true,
            drawSpecturm: true,
        };
        this.analyserNode = analyserNode;
        this.canvas = canvas;
        this.context2D = canvas.getContext("2d")!;
        this.waveformData = new Float32Array(
            visualizerDefaultOptions.frameSize
        );
        this.frequencyData = new Float32Array(
            visualizerDefaultOptions.frameSize / 2
        );

        // Set theme
        this.theme(getColorScheme() === "dark");
    }

    drawWaveform_(width: number, height: number) {
        this.analyserNode.getFloatTimeDomainData(this.waveformData);
        const size: number = this.waveformData.length;
        // Draw twice the width to make the waveform more visible
        const increment: number = (width * 2.0) / size;
        this.context2D.beginPath();
        // Find the first zero-crossing where the next value is positive
        let i = 0;
        while (
            i < size - 1 &&
            !(this.waveformData[i] < 0 && this.waveformData[i + 1] >= 0)
        ) {
            ++i;
        }
        // Start drawing from the first zero-crossing
        for (let x = 0; x < width; x += increment, ++i) {
            // Use modulo operator to wrap the index around to the start of the array
            // Get weird artifacting at the wraparound
            const index = i % size;
            this.context2D.lineTo(
                x,
                (-this.waveformData[index] * 0.5 + 0.5) * height
            );
        }
        this.context2D.strokeStyle = this.waveformColor;
        this.context2D.stroke();
    }

    drawSpectrum_(width: number, height: number) {
        this.analyserNode.getFloatFrequencyData(this.frequencyData);
        // get min max of frequency data
        // We only visualize 0 to half of nyquist.
        const increment = width / (this.frequencyData.length / 2);
        // |frequencyData| is clamped between 0.0dBFS ~ MIN_DBFS (-120)
        this.context2D.beginPath();
        for (let x = 0, i = 0; x < width; x += increment, ++i) {
            if (i === 0) {
                this.context2D.moveTo(
                    x,
                    freqHeightScale(this.frequencyData[i], height)
                );
            } else {
                this.context2D.lineTo(
                    x,
                    freqHeightScale(this.frequencyData[i], height)
                );
            }
        }
        this.context2D.lineTo(width, height);
        this.context2D.lineTo(0, height);
        this.context2D.closePath();
        this.context2D.fillStyle = this.spectrumFill;
        this.context2D.fill();
        this.context2D.strokeStyle = this.spectrumColor;
        // make line width only for spectrum
        this.context2D.lineWidth = 2;
        this.context2D.stroke();
        this.context2D.lineWidth = 1;
    }

    /**
     * Draw waveform and spectrum
     */
    drawVisualization_() {
        if (!this.running) return;
        this.context2D.clearRect(
            0,
            0,
            this.context2D.canvas.width,
            this.context2D.canvas.height
        );
        const w = this.context2D.canvas.width;
        const h = this.context2D.canvas.height;
        this.drawSpectrum_(w, h);
        this.drawWaveform_(w, h);
        requestAnimationFrame(this.drawVisualization_.bind(this));
    }

    /**
     * Start the visualizer
     */
    start() {
        this.running = true;
        this.resize();
        this.drawVisualization_();
    }

    /**
     * Stop the visualizer
     */
    stop() {
        this.running = false;
    }

    /**
     * Set the visualizer dimensions
     */
    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    /**
     * Set the visualizer theme
     */
    theme(isDark: boolean) {
        if (isDark) {
            this.waveformColor = waveformColorDark;
            this.spectrumColor = spectrumColorDark;
            this.spectrumFill = spectrumFillDark;
        } else {
            this.waveformColor = waveformColorLight;
            this.spectrumColor = spectrumColorLight;
            this.spectrumFill = spectrumFillLight;
        }
    }
}
