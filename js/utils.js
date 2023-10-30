export async function convertAudioBufferToWavBlob(audioBuffer) {
    return new Promise(function (resolve) {
      var worker = new Worker('./js/wave-worker.js');
  
      worker.onmessage = function (e) {
        var blob = new Blob([e.data.buffer], { type: 'audio/wav' });
        resolve(blob);
      };
  
      let pcmArrays = [];
      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        pcmArrays.push(audioBuffer.getChannelData(i));
      }
  
      worker.postMessage({
        pcmArrays,
        config: { sampleRate: audioBuffer.sampleRate },
      });
    });
  }
  
  export function downloadBlob(blob, name) {
    var audio = document.getElementById('recorder')
    const blobUrl = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.setAttribute('id','linkA')
    link.innerHTML = "Click here to download"
    link.href = blobUrl;
    link.download = name;
    audio.append(link);
  }
  
  export function initButtonListener(mediaRecorder) {
    const recordButton = document.getElementById('record-button');
    recordButton.innerHTML = 'Record';
  
    recordButton.addEventListener('click', () => {
      if (mediaRecorder.state === 'inactive') {
        mediaRecorder.start();
        recordButton.innerHTML = 'Recording ...';
      } else {
        mediaRecorder.stop();
        recordButton.innerHTML = 'Record';
      }
    });
  }