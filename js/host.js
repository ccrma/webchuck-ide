/* Connect IDE buttons to WebChucK */
var startButton = document.getElementById("startChuck");
var compileButton = document.getElementById("compileButton");
var replaceButton = document.getElementById("replaceButton");
var removeButton = document.getElementById("removeButton");
var micButton = document.getElementById("micButton");
var recButton = document.getElementById("recordButton");

/* Connect Shreds and Console to WebChucK */
var shredsToRows = {};
var shredsTable = document.getElementById("shredsTable");
var outputConsole = document.getElementById("console");

/* File handling */
var fileUploadButton = document.getElementById("fileUploadButton");
var fileUploader = document.getElementById("fileUploader");

// For preloading files
// hack for 220a moved to index.html
// var serverFilesToPreload = serverFilesToPreload || [];
var preloadedFilesReady = preloadFilenames(serverFilesToPreload);

// VM audio params
var sampleRate = 44100; // actual sample rate will be set during init
var chuckNowCached = 0; // local copy of chuck current time
var displayDigits = 0; // how many digits e.g., 5 digits in 44100

let activeHID = false;

// use named functions instead of anonymous ones
// so they can be replaced later if desired
var chuckCompileButton = function ()
{

// hack for 220a, get name from index.html
    theChuck.runFile(vFilename220a);
    
    if(precompilerMode === 0) {
        theChuck.runCode(window.localStorage.getItem('chuckCache')).then(
            function (shredID)
            {
                addShredRow(shredID);
            },
            function (failure) { }
        )
    }
    if(precompilerMode === 1){
        theChuck.runCode('<<< "precompiling [iter~] prototype mode...", "" >>>;')
        main().then(() => {
            if (parsed === undefined){
                theChuck.runCode(window.localStorage.getItem('chuckCache')).then(
                    function (shredID)
                    {
                        addShredRow(shredID);
                    },
                    function (failure) { }
                )
            } else {
                theChuck.runCode(parsed).then(
                    function (shredID)
                    {
                        addShredRow(shredID);
                    },
                    function (failure) { }
                )
            }
        })
    } 
};

var chuckReplaceButton = function ()
{
    // send message to replace last shred with this code
    if(precompilerMode === 0) {
        theChuck.replaceCode(window.localStorage.getItem('chuckCache')).then(
            function (shreds)
            {
                removeShredRow(shreds.oldShred);
                addShredRow(shreds.newShred);
            },
            function (failure) { }
        );
    }

    if(precompilerMode === 1){
        theChuck.runCode('<<< "precompiling [iter~]..." >>>;')
        main().then(() => {
            if (parsed === undefined){
                theChuck.replaceCode(window.localStorage.getItem('chuckCache')).then(
                    function (shreds)
                    {
                        removeShredRow(shreds.oldShred);
                        addShredRow(shreds.newShred);
                    },
                    function (failure) { }
                );
            } else {
                theChuck.replaceCode(parsed).then(
                    function (shreds)
                    {
                        removeShredRow(shreds.oldShred);
                        addShredRow(shreds.newShred);
                    },
                    function (failure) { }
                );
            }
        })
    } 
};

var chuckRemoveButton = function ()
{
    // send message to remove most recent shred
    theChuck.removeLastCode().then(
        function (shred)
        {
            removeShredRow(shred);
        },
        function (failure) { }
    );
};

var chuckMicButton = function ()
{
    navigator.mediaDevices
        .getUserMedia({
            video: false,
            audio: {
                echoCancellation: false,
                autoGainControl: false,
                noiseSuppression: false,
            },
        })
        .then((stream) => {
            const adc = audioContext.createMediaStreamSource(stream);
            adc.connect(theChuck);
        });
    micButton.disabled = true;
};

/* File handling */
var fileExplorer = new Set();
var fileUploadButtonClick = function () { fileUploader.click(); };

/* Upload Files via Button */
function handleFiles()
{
    var fileList = [...this.files];
    fileList.forEach(file =>
    {
        var reader = new FileReader();
        if (file.name.endsWith(".ck")) 
        {
            reader.onload = e =>
            {
                localStorage['chuckCacheName'] = globalFileName = file.name;
                loadChuckFileFromString(e.target.result);
                printToOutputConsole("Loaded chuck file: " + file.name);

                // text to array buffer
                var data = new Uint8Array(e.target.result.length);
                for (var i = 0; i < e.target.result.length; i++)
                {
                    data[i] = e.target.result.charCodeAt(i);
                }

                // If chuck is already running, create file
                if (theChuck !== undefined)
                {
                    theChuck.createFile("", file.name, data);
                } else
                {
                    // If chuck is not running, add file to preUploadFiles
                    preUploadFiles.add(file);
                }
            };
            reader.readAsText(file);
        }
        else
        {
            reader.onload = function (e)
            {
                var data = new Uint8Array(e.target.result);
                // If chuck is already running, create file
                if (theChuck !== undefined)
                {
                    theChuck.createFile("", file.name, data);
                    printToOutputConsole("Loaded file: " + file.name);
                } else
                {
                    // If chuck is not running, add file to preUploadFiles
                    preUploadFiles.add(file);
                    printToOutputConsole("Preloaded file: " + file.name);
                }
            };
            reader.readAsArrayBuffer(file);
        }

        // Add file to file explorer
        fileExplorer.add(file);
    });
    updateFileExplorer();
}
fileUploader.addEventListener("change", handleFiles, false);

/* Upload Files via Drag and Drop */
/* Not yet implemented */
/*
function uploadHandler(ev)
{
    console.log("File(s) dropped");
    ev.preventDefault(); // Prevent opening of file

    if (ev.dataTransfer.items) {
        // DataTransferItemList interface to process the file(s)
        [...ev.dataTransfer.items].forEach(item =>
        {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                console.log('... file[' + file.name + '].');
                console.log(file.getValue());
            }
        });
    }
    displayFileExplorer();
}
function dragOverHandler(ev)
{
    console.log("dragOver");
    ev.preventDefault();

    // Set the dropEffect to move
    ev.dataTransfer.dropEffect = "move";
}
*/

// Process pre uploaded files
var processPreUploadFiles = function ()
{
    preUploadFiles.forEach(file =>
    {
        var reader = new FileReader();
        reader.onload = function (e)
        {
            var data = new Uint8Array(e.target.result);
            theChuck.createFile("", file.name, data);
        };
        reader.readAsArrayBuffer(file);
        printToOutputConsole("Loaded file: " + file.name);
    });
    preUploadFiles.clear();
};


// Update file explorer display
function updateFileExplorer()
{
    var fileExplorerElement = document.getElementById("file-explorer");
    fileExplorerElement.innerHTML = "";
    /* Add preloaded files to file explorer */
    serverFilesToPreload.forEach(fileName =>
    {
        var fileElement = document.createElement("div");
        fileElement.classList.add("file");
        // Add icon before file name
        var iconElement = "<i class='icon icon-upload'></i> ";
        fileElement.innerHTML = iconElement + fileName;
    });
    /* Add files to file explorer */
    fileExplorer.forEach(file =>
    {
        var fileElement = document.createElement("div");
        fileElement.classList.add("file");
        // Add icon before file name
        var iconElement = "<i class='icon icon-upload'></i> ";
        fileElement.innerHTML = iconElement + file.name;

        fileExplorerElement.appendChild(fileElement);
    });
}

startButton.addEventListener("click", async function ()
{
    printToOutputConsole("Starting WebChucK...");
    startButton.disabled = true;
    await preloadedFilesReady;
    // start chuck
    await startChuck();
    // start visualizer
    await startVisualizer(); 
});

// Button initial states
startButton.disabled = false;
compileButton.disabled = true;
replaceButton.disabled = true;
removeButton.disabled = true;
micButton.disabled = true;
recButton.disabled = true;

// Connect buttons to WebChucK
compileButton.addEventListener("click", chuckCompileButton);
replaceButton.addEventListener("click", chuckReplaceButton);
removeButton.addEventListener("click", chuckRemoveButton);
micButton.addEventListener("click", chuckMicButton);
fileUploadButton.addEventListener("click", fileUploadButtonClick);

var displayFormatTime = function (i)
{
   // add zero in front of numbers < 10
   if( i < 10 )
   {
       i = "0" + i;
   }
   return i;
}

// sample edition
var displayFormatTime2 = function (i)
{
   var digits = Math.log(i) * Math.LOG10E + 1 | 0;
   if( digits == 0 ) digits = 1; // for i == 0
   var diff = displayDigits - digits;

   // formatted string
   var s = "";
   // add zero in front of numbers < 10
   while( diff > 0 )
   {
       s += "0";
       diff--;
   }
   // add value
   s += i;

   // return
   return s;
}

// cache sample rate
function cacheSampleRate( srate )
{
    // cached
    sampleRate = srate;
    // do some digit compute for display
    displayDigits = Math.log(srate) * Math.LOG10E + 1 | 0;
}


// Periodic function to get chuck time | 1.5.0.8
function chuckGetNow()
{
    // get the chuck current time
    theChuck.now()
    .then( (samples) =>
    {
        // get value
        chuckNowCached = samples;
        // samples
        var samplesDisplay = samples % sampleRate;
        // seconds
        var secondsTotal = samples / sampleRate;
        var secondsDisplay = Math.floor(secondsTotal % 60);
        // minutes
        var minutesTotal = secondsTotal / 60;
        var minutesDisplay = Math.floor(minutesTotal % 60);
        // hours
        var hoursTotal = minutesTotal / 60;
        var hoursDisplay = Math.floor(hoursTotal);

        // the display value
        var str = displayFormatTime(hoursDisplay) + ":"
             + displayFormatTime(minutesDisplay) + ":"
             + displayFormatTime(secondsDisplay) + "."
             + displayFormatTime2(samplesDisplay);

        // get the HTML element
        const e = document.getElementById('chuck-now-time');
        // replace
        e.innerText = str;
    } );
}

// Once WebChucK is loaded, enable buttons
theChuckReady.then(function ()
{
    compileButton.disabled = false;
    replaceButton.disabled = false;
    removeButton.disabled = false;
    micButton.disabled = false;
    recButton.disabled = false;
    // Load preUploadFiles into ChucK
    processPreUploadFiles();

    // set interval timer to read chuck time
    setInterval( chuckGetNow, 50 );

    // print audio info
    theChuck.getParamInt("SAMPLE_RATE")
    .then( (value) => { cacheSampleRate(value); printToOutputConsole("sample rate: " + value); } );
    //theChuck.getParamInt("INPUT_CHANNELS")
    //.then( (value) => { outputConsole.value += "inputs: " + value + " "; } );
    //theChuck.getParamInt("OUTPUT_CHANNELS")
    //.then( (value) => { outputConsole.value += "outputs: " + value + "\n"; } );
    //theChuck.getParamInt("IS_REALTIME_AUDIO_HINT")
    //.then( (value) => { outputConsole.value += "real-time audio: " + (value ? "ON" : "OFF") + "\n"; } );
    // print version and ready message
    theChuck.getParamString("VERSION")
    .then( (value) => { printToOutputConsole("system version: " + value); } )
    .finally( () => { printToOutputConsole("WebChucK is ready!"); });

    // console width
    theChuck.setParamInt("TTY_WIDTH_HINT", consoleWidth());
    theChuck.runCode(`
    global Event _msg;
    
    global Event _hid;
    global int _hidMultiple;
    0 => global int _cursorX;
    0 => global int _cursorY;

    0 => global float _deltaX;
    0 => global float _deltaY;
    
    global string _key;
    global int _isDown;
    global int _isUp;
    global int _isMouseDown;
    global int _isMouseUp;
    global int _isScroll;
    global int _ascii;
    global int _which;
    global int _mouseActive;
    global int _kbdActive;
    global int _mouseMotion;
    global float _scaledCursorX;
    global float _scaledCursorY;
    
    public class HidMsg {
        int cursorX;
        int cursorY;
        float deltaX;
        float deltaY;
        string key;
        int ascii;
        int which;
        float scaledCursorX;
        float scaledCursorY;
    
        function int isButtonDown() {
            if(_mouseActive){
                if(_isMouseDown){
                    0 => _isMouseDown;
                    return 1;
                }
            }
            if(_kbdActive){
                if(_isDown){
                    0 => _isDown;
                    return 1;
                }
            }
            return 0;
        }
    
        function int isButtonUp() {
            if(_mouseActive){
                if(_isMouseUp){
                    0 => _isMouseUp;
                    return 1;
                }
            }
            if(_kbdActive){
                if(_isUp){
                    0 => _isUp;
                    return 1;
                }
            }
            return 0;
        }
    
        function int isMouseMotion(){
            return _mouseMotion;
        }
    
        function int isWheelMotion(){
            return _isScroll;
        }
    
        function void _set(){
            while(true){
                _hid => now;
                _cursorX => cursorX;
                _cursorY => cursorY;
                _key => key;
                _ascii => ascii;
                _which => which;
                _deltaX => deltaX;
                _deltaY => deltaY;
                _scaledCursorX => scaledCursorX;
                _scaledCursorY => scaledCursorY;
            }
        }
        spork~_set();
    }
        `);
        theChuck.runCode(`
        global Event _msg;
    
    global Event _hid;
    global int _hidMultiple;
    global int _cursorX;
    global int _cursorY;
    
    global float _deltaX;
    global float _deltaY;
    
    global string _key;
    global int _isDown;
    global int _isUp;
    global int _isMouseDown;
    global int _isMouseUp;
    global int _isScroll;
    global int _ascii;
    global int _which;
    global int _mouseActive;
    global int _kbdActive;
    global int _mouseMotion;
    global float _scaledCursorX;
    global float _scaledCursorY;
    
    public class Hid extends Event{
    
        0 => int isMouseOpen;
        0 => int isKBDOpen;
        0 => int active;
    
        string deviceName; 
    
        function string name(){
            return deviceName;
        }
    
        // just a way to stop the interface for now
        function int openMouse(int num){
            if(num == -1){
                false => active;
            } else {
                "virtualJS mouse/trackpad" => deviceName;
                true => active;
            }
            active => isMouseOpen => _mouseActive;;
            return active;
        }
    
        function int openKeyboard(int num){
            if(num == -1){
                false => active => _kbdActive;
            } else {
                "virtualJS keyboard" => deviceName;
                true => active ;
            }
            active => isKBDOpen => _kbdActive;
            return active;
        }
    
        // Global event gets hacked by local object
        function void _hackEvent(){
            while(true){
                _hid => now;
                this.broadcast();
            }
        }
        spork~_hackEvent();
    
        //The argument here is just to execute older code
        function int recv(HidMsg msg){
            _msg => now;
            return 1;
        }
    }
        `);
        activeHID = true;
});

// Override default print function, print to output console
// self invoking function
chuckPrint = function ()
{
    if (outputConsole) outputConsole.value = ""; // clear browser cache
    return function (text)
    {
        if (arguments.length > 1)
        {
            text = Array.prototype.slice.call(arguments).join(" ");
        }

        if (outputConsole)
        {
            outputConsole.value += text + "\n";
            outputConsole.scrollTop = outputConsole.scrollHeight; // focus on bottom
        }
    };
}();

// Add a row to the shreds table
function addShredRow(theShred)
{
    var row = shredsTable.insertRow();
    var cell0 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    var cell2 = row.insertCell(2);
    var cell3 = row.insertCell(3);

    shredsToRows[theShred] = row;

    cell0.innerHTML = "" + theShred;
    /* cell1.innerHTML = chuckEditor.getValue().substring(0, 30) + "..."; */
    cell1.innerHTML = globalFileName;
    (function (cell, myShred)
    {
        var getTime = function ()
        {
            return Math.floor(Date.now() / 1000);
        };

        // get chuck current time | 1.5.0.8
        var startTime = chuckNowCached; // was: = getTime();
        var removed = false;

        function updateTime()
        {
            // get chuck current time
            var now = chuckNowCached; // was: = getTime();
            // convert to seconds
            var elapsed = (now - startTime) / sampleRate;
            // compute minutes and seconds
            var m = Math.floor(elapsed / 60);
            var s = Math.floor(elapsed % 60);
            // piggyback off time keeper to remove row
            // if it stops running
            if (!(myShred in shredsToRows))
            {
                removed = true;
            }
            // check if shred active, if not remove from display
            theChuck.isShredActive(myShred)
            .then( function(result)
            {
                if (!result && !removed)
                {
                    removed = true;
                    removeShredRow(myShred);
                    return;
                }
            });

            // only keep updating time if row still exists
            if (!removed && document.contains(cell))
            {
                cell.innerHTML = displayFormatTime(m) + ":"
                               + displayFormatTime(s);
                setTimeout(updateTime, 300);
            }
        }

        updateTime();
    })(cell2, theShred);

    /* Create a remove button for the shred */
    var removeButton = document.createElement("INPUT");
    removeButton.setAttribute("type", "image");
    removeButton.setAttribute("src", "./assets/icons/remove.png");
    removeButton.classList.add("chuckButton");
    removeButton.setAttribute("alt", "remove button");
    cell3.appendChild(removeButton);

    removeButton.addEventListener(
        "click",
        (function (shredID)
        {
            return function ()
            {
                theChuck.removeShred(shredID).then(
                    function (removedShred)
                    {
                        removeShredRow(theShred);
                    },
                    function (failure)
                    {
                        console.log(failure);
                    }
                );
            };
        })(theShred)
    );
}
// Remove a single shred row from the table
function removeShredRow(theShred)
{
    if (theShred in shredsToRows)
    {
        shredsToRows[theShred].parentNode.removeChild(shredsToRows[theShred]);
        delete shredsToRows[theShred];
    }
}
