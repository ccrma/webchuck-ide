//(function(n){var a=Math.min,s=Math.max;var e=function(n,a,e){var s=e.length;for(var t=0;t<s;++t)n.setUint8(a+t,e.charCodeAt(t))};var t=function(t,e){this.sampleRate=t;this.numChannels=e;this.numSamples=0;this.dataViews=[]};t.prototype.encode=function(r){var t=r[0].length,u=this.numChannels,h=new DataView(new ArrayBuffer(t*u*2)),o=0;for(var e=0;e<t;++e)for(var n=0;n<u;++n){var i=r[n][e]*32767;h.setInt16(o,i<0?s(i,-32768):a(i,32767),true);o+=2}this.dataViews.push(h);this.numSamples+=t};t.prototype.finish=function(s){var n=this.numChannels*this.numSamples*2,t=new DataView(new ArrayBuffer(44));e(t,0,"RIFF");t.setUint32(4,36+n,true);e(t,8,"WAVE");e(t,12,"fmt ");t.setUint32(16,16,true);t.setUint16(20,1,true);t.setUint16(22,this.numChannels,true);t.setUint32(24,this.sampleRate,true);t.setUint32(28,this.sampleRate*4,true);t.setUint16(32,this.numChannels*2,true);t.setUint16(34,16,true);e(t,36,"data");t.setUint32(40,n,true);this.dataViews.unshift(t);var a=new Blob(this.dataViews,{type:"audio/wav"});this.cleanup();return a};t.prototype.cancel=t.prototype.cleanup=function(){delete this.dataViews};n.WavAudioEncoder=t})(self);

import { convertAudioBufferToWavBlob, downloadBlob, initButtonListener } from './utils.js'

let firstTime = true
let recorder = null
let counter = 0



  var recordButton = document.getElementById('recordButton')
  recordButton.addEventListener("click", startRecording)

  var stopButton = document.getElementById('removeButton')
  stopButton.addEventListener("click", stopRecording)

  let dataArray = []; 

  function startRecording() {

    var audio = document.getElementById('recorder')
    var mainaudio = document.createElement('audio')

    const stream = GLOBAL_audioContext.createMediaStreamDestination()
    recordButton.style.backgroundColor = "green"
    recordButton.innerHTML = "Recording..."


    recorder = new MediaRecorder(stream.stream);
    GLOBAL_audioSend.connect(stream)

    recorder.start()

    GLOBAL_audioSend.gain.setValueAtTime(0.96, GLOBAL_audioContext.currentTime);

    recorder.ondataavailable = async function (ev) {

        dataArray.push(ev.data)

        let audioData = new Blob(dataArray,{type: 'audio/webm;codecs=opus' })
        let audioSrc = window.URL.createObjectURL(audioData)
         
        mainaudio.setAttribute('controls','controls')
        mainaudio.setAttribute('src',URL.createObjectURL(audioData))
        
        if(firstTime){
            var instructionsRec = document.createElement('p')
            instructionsRec.innerHTML = "Click play to listen, or the link below the player to download"
            audio.append(instructionsRec)
            firstTime = false
        }

        var titleRec = document.createElement('p')
        titleRec.innerHTML = "Recorded Audio ("+ counter + ") " + new Date(Date.now()).toDateString()
        mainaudio.innerHTML = '<audio src="'+ URL.createObjectURL(audioData) + '" type="audio/wav"> </audio>'

        counter++
        mainaudio.src = audioSrc
        mainaudio.load()
        
        audio.append(titleRec)
        audio.append(mainaudio)

    }

    recorder.addEventListener('stop', async () => {
        const webaBlob = new Blob(dataArray, { type: 'audio/webm;codecs=opus' });

        const arrayBuffer = await webaBlob.arrayBuffer();

        const audioBuffer = await GLOBAL_audioContext.decodeAudioData(arrayBuffer);

        const wavBlob = await convertAudioBufferToWavBlob(audioBuffer);

        downloadBlob(wavBlob, 'recording');

        dataArray =[];
    })
}



function stopRecording() {
    recorder.stop()
    recordButton.innerHTML = "Record"
    recordButton.style.backgroundColor = "red"
}
