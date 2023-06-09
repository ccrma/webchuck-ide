let send
let analyser
let visual

// set up and start visualizer
// dependency: 'GLOBAL_audioSend' and 'GLOBAL_audioContext'
//     these are defined and set in src/webchuck_host.js;
//     this function is designed to be called during initialization
//     and to be run after startChuck()
var startVisualizer = async function ()
{
	// get canvas
	var cnv = document.getElementById("canvas");
	// get audioSend -- the audio output of chuck
	send = GLOBAL_audioSend;
	// create analyser
	analyser = GLOBAL_audioContext.createAnalyser();
	// instantiate visualizer
	visual = new Visualizer(cnv, analyser);
	// connect chuck output to analyser
	send.connect(analyser);
	// connect analyser to audioContext
	// (ge: seems not needed if startChucK already connects to context destination?)
	// analyser.connect( audioContext.destination );
	// start visualizer
	visual.drawVisualization_();
	visual.start();
};

class Visualizer
{
	constructor(canvas, analyserNode, visualizerOptions)
	{
		const visualizerDefaultOptions = {
			frameSize: 2048,
			drawWaveform: true,
			drawSpecturm: true,
		};

		this.context2D = canvas.getContext('2d');
		this.analyserNode = analyserNode;
		this.waveformData = new Float32Array(visualizerDefaultOptions.frameSize);
		this.frequencyData = new Float32Array(visualizerDefaultOptions.frameSize);
		this.running = false;
	}

	drawWaveform_()
	{
		this.analyserNode.getFloatTimeDomainData(this.waveformData);
		// The length of waveform data corresponds to the canvas width.
		const width = this.context2D.canvas.width;
		const height = this.context2D.canvas.height;
		const increment = width / this.waveformData.length;
		this.context2D.beginPath();
		this.context2D.moveTo(0, height * 0.5);
		for (let x = 0, i = 0; x < width; x += increment, ++i)
		{
			this.context2D.lineTo(x, (this.waveformData[i] * 0.5 + 0.5) * height);
		}
		this.context2D.stroke();
	}

	drawSpectrum_()
	{
		this.analyserNode.getFloatFrequencyData(this.frequencyData);
		const width = this.context2D.canvas.width;
		const height = this.context2D.canvas.height;
		// We only care about below nyquist. 
		const increment = width / (this.frequencyData.length * 0.5);
		this.context2D.beginPath();
		this.context2D.moveTo(0, height * 0.5);
		for (let x = 0, i = 0; x < width; x += increment, ++i)
		{
			// |frequencyData| is between 0.0dBFS ~ -200dbFS.
			this.context2D.lineTo(x, -this.frequencyData[i]);
		}
		this.context2D.stroke();
	}

	drawVisualization_()
	{
		if (!this.running) return;
		this.context2D.clearRect(
			0, 0, this.context2D.canvas.width, this.context2D.canvas.height);
		this.drawWaveform_();
		this.drawSpectrum_();
		requestAnimationFrame(this.drawVisualization_.bind(this));
	}

	start()
	{
		this.running = true;
		this.drawVisualization_();
	}

	stop()
	{
		this.running = false;
	}
}

