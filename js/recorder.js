(function(n){var a=Math.min,s=Math.max;var e=function(n,a,e){var s=e.length;for(var t=0;t<s;++t)n.setUint8(a+t,e.charCodeAt(t))};var t=function(t,e){this.sampleRate=t;this.numChannels=e;this.numSamples=0;this.dataViews=[]};t.prototype.encode=function(r){var t=r[0].length,u=this.numChannels,h=new DataView(new ArrayBuffer(t*u*2)),o=0;for(var e=0;e<t;++e)for(var n=0;n<u;++n){var i=r[n][e]*32767;h.setInt16(o,i<0?s(i,-32768):a(i,32767),true);o+=2}this.dataViews.push(h);this.numSamples+=t};t.prototype.finish=function(s){var n=this.numChannels*this.numSamples*2,t=new DataView(new ArrayBuffer(44));e(t,0,"RIFF");t.setUint32(4,36+n,true);e(t,8,"WAVE");e(t,12,"fmt ");t.setUint32(16,16,true);t.setUint16(20,1,true);t.setUint16(22,this.numChannels,true);t.setUint32(24,this.sampleRate,true);t.setUint32(28,this.sampleRate*4,true);t.setUint16(32,this.numChannels*2,true);t.setUint16(34,16,true);e(t,36,"data");t.setUint32(40,n,true);this.dataViews.unshift(t);var a=new Blob(this.dataViews,{type:"audio/wav"});this.cleanup();return a};t.prototype.cancel=t.prototype.cleanup=function(){delete this.dataViews};n.WavAudioEncoder=t})(self);

let firstTime = true
let recorder = null
let counter = 0

  recordButton = document.getElementById('recordButton')
  recordButton.addEventListener("click", startRecording)

  stopButton = document.getElementById('removeButton')
  stopButton.addEventListener("click", stopRecording);

  let dataArray = []; 

  function startRecording() {
    console.log("Recording");

    const stream = GLOBAL_audioContext.createMediaStreamDestination();
    
    recorder = new MediaRecorder(stream.stream);
    GLOBAL_audioSend.connect(stream);

    recorder.start();

    recorder.ondataavailable = function (ev) {

        dataArray.push(ev.data)

        let audioData = new Blob(dataArray,{'type': 'audio/webm;' });
        let audioSrc = window.URL.createObjectURL(audioData);

        var audio = document.getElementById('recorder');
        var mainaudio = document.createElement('audio')

        mainaudio.setAttribute('controls','controls')
        
        if(firstTime){
            var instructionsRec = document.createElement('p')
            instructionsRec.innerHTML = "Click play to listen, after clicking play you can download it using the three dots on the right"
            audio.append(instructionsRec)
            firstTime = false
        }

        var titleRec = document.createElement('p')
        titleRec.innerHTML = "Recorded Audio ("+ counter + ") " + new Date(Date.now()).toDateString()
        mainaudio.innerHTML = '<audio controls src="'+ URL.createObjectURL(audioData) + '"> </audio>';
        counter++
        mainaudio.src = audioSrc
        mainaudio.load()
        
        
        audio.append(titleRec)
        audio.append(mainaudio)

    }

    recorder.onstop = function (ev) {
        dataArray =[];
    }
}



function stopRecording() {
recorder.stop();
}


function createDownloadLink(blob, encoding) {
var url = URL.createObjectURL(blob);
var au = document.createElement('audio');
var li = document.createElement('li');
var link = document.createElement('a');
//add controls to the "audio" element 
au.controls = true;
au.src = url; //link the a element to the blob 
link.href = url;
link.download = new Date().toISOString() + '.' + encoding;
link.innerHTML = link.download;
//add the new audio and a elements to the li element 
li.appendChild(au);
li.appendChild(link); //add the li element to the ordered list 
recordingsList.appendChild(li);
}
