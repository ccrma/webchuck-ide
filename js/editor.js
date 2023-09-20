var chuckEditor = ace.edit("editor");
chuckEditor.setTheme("ace/theme/chuck");
chuckEditor.session.setMode("ace/mode/chuck");
chuckEditor.setOptions({
    fontSize: "14px",
    fontFamily: "Monaco, Menlo, Consolas, 'Courier New', monospace",
    cursorStyle: "ace",
    useSoftTabs: true,
    showFoldWidgets: true,
    foldStyle: "markbeginend",
});
chuckEditor.container.style.lineHeight = 1.25;
chuckEditor.renderer.updateFontSize();
chuckEditor.session.setUseWrapMode(true);

/* Set up and allow printing to console */
var outputConsole = document.getElementById("console");
var printToOutputConsole = function (text)
{
    outputConsole.value += text + "\n";
    outputConsole.scrollTop = outputConsole.scrollHeight; // focus on bottom
    console.log(text); // print to console.log as well
};

/* Calculate console width in monospace */
var consoleWidth = function ()
{
    var consoleWidth = outputConsole.clientWidth;
    var consoleCharWidth = consoleWidth / 9.5;
    //console.log("Console width: " + Math.floor(consoleCharWidth));
    return Math.floor(consoleCharWidth)-5;
}
window.addEventListener("resize", () => {
    if (theChuck === undefined) return;
    theChuck.setParamInt("TTY_WIDTH_HINT", consoleWidth());
});

/* Handle preUpload and server files before Chuck is ready */
var preUploadFiles = new Set(); // File type

/* Default filename is untitled.ck */
var globalFileName = (localStorage['chuckCacheName'] !== undefined) ? localStorage['chuckCacheName'] : "untitled.ck";
/* Check if we have a cached chuck file */
var doesChuckCacheExist = (localStorage['chuckCacheExist'] === 'true') || false; // default state

/* Load in chuck file from cache for edit, or load in the default chuck file */
var launchChuckFile = async function ()
{
    // Get url parameters
    const urlParams = new URLSearchParams(window.location.search);
    // Get chuck file 'url' or 'URL' parameter
    const fileURL = urlParams.get('url') || urlParams.get('URL');

    if (fileURL !== null && fileURL.endsWith(".ck")) {
        // fetch chuck file from url
        try {
            await fetch(fileURL)
                .then(response => response.text())
                .then(text => {
                    loadChuckFileFromString(text);
                    globalFileName = fileURL.split("/").pop();
                    printToOutputConsole("Loaded file from URL: " + globalFileName);
                });
        } catch (error) {
            printToOutputConsole("Failed to load chuck URL: " + fileURL);
        }
    } else if (doesChuckCacheExist) 
    {
    // If urlParam is not null, or if fails to load chuck file from cache, load load cache or default chuck file
        // Set chuck file to last saved file
        loadChuckFileFromString(localStorage['chuckCache']);
        // Wait until the page is loaded to print this to the console
        window.onload = function ()
        {
            // Set the chuck file name
            printToOutputConsole("Loaded autosave: " + localStorage['chuckCacheName'] + " (" + localStorage['chuckCacheDate'] + ")");
            globalFileName = localStorage['chuckCacheName'];
            // cast to int
            drawing(parseInt(localStorage.getItem("graphicStatus")));
        };
    } else {
        // New default chuck file
        // TODO: Up to interpretation, but I think this should be a default chuck file
        loadServerFile("./template/untitled.ck");
    }

    // Generate GUI, eval from global context
    return Promise.resolve();
};
/* Create a new chuck file */
var newChuckFileButton = document.getElementById("newFileButton");
var createNewChuckFile = function ()
{
    // Load default chuck file
    loadChuckFileFromString("");
    // Wipe chuck cache
    doesChuckCacheExist = false;
    localStorage['chuckCacheExist'] = 'false';
    localStorage['chuckCacheName'] = globalFileName = "untitled.ck";
};
newChuckFileButton.addEventListener("click", createNewChuckFile);

/* Load a file from server */
var loadServerFile = function (fileName)
{
    // If file is a .ck file, load it into editor
    if (fileName.split('.').pop() == "ck")
    {
        fetch(fileName)
            .then(response => response.text())
            .then(text =>
            {
                fileName = fileName.split("/").pop();
                chuckEditor.setValue(text);
                chuckEditor.clearSelection();
                chuckEditor.gotoLine(0, 0, true);
                localStorage['chuckCacheName'] = globalFileName = fileName;
                if (fileName !== "untitled.ck")
                {
                    printToOutputConsole("Loaded chuck file: " + fileName);
                }
            });
    }
    else 
    {
        // If file is not a .ck file, load it into chuck or add it to preLoadServerFiles
        fetch(fileName)
            .then(response => response.blob())
            .then(blob =>
            {
                var reader = new FileReader();
                reader.onload = function (e)
                {
                    var data = new Uint8Array(e.target.result);
                    // If chuck is already running, create file
                    if (theChuck !== undefined)
                    {
                        theChuck.createFile("", fileName.split("/").pop(), data);
                        printToOutputConsole("Loaded file: " + fileName.split("/").pop());
                    }
                    else
                    {
                        // If chuck is not running, add file to preUploadFiles
                        // convert blob to file and add to preUploadFiles
                        var file = new File([blob], fileName.split("/").pop(), { type: blob.type });
                        preUploadFiles.add(file);
                        printToOutputConsole("Preloaded file: " + fileName.split("/").pop());
                    }
                };
                reader.readAsArrayBuffer(blob);
            });

    }
};
/* Load chuck file from string */
var loadChuckFileFromString = function (fileData)
{
    chuckEditor.setValue(fileData);
    chuckEditor.clearSelection();
    chuckEditor.gotoLine(0, 0, true);
};


/* Toggle vim mode */
var vimMode = (localStorage['vimMode'] === 'true') || false; // default state
var vimModeButton = document.getElementById("vimModeButton");
function setVimMode(vim)
{
    if (vim)
    {
        // Set vim mode
        vimModeButton.innerHTML = "Vim Mode: On";
        chuckEditor.setKeyboardHandler("ace/keyboard/vim");
        localStorage['vimMode'] = 'true';
    }
    else
    {
        // Set normal mode
        vimModeButton.innerHTML = "Vim Mode: Off";
        chuckEditor.setKeyboardHandler(null);
        localStorage['vimMode'] = 'false';
    }
}
var toggleVimMode = function () { setVimMode(vimMode = !vimMode); };
vimModeButton.addEventListener("click", toggleVimMode);


/* Toggle dark mode */
var darkMode = (localStorage['darkMode'] === 'true') || false; // default state
var darkModeButton = document.getElementById("darkModeButton");
function setDarkMode(dark)
{
    if (dark)
    {
        // Set dark mode
        darkModeButton.innerHTML = "Dark Mode: On";
        document.getElementById("ide").classList.add("dark");
        document.getElementById("editor").classList.add("dark");
        document.getElementById("chuck-nav").classList.add("dark");
        document.getElementById("canvas").classList.add("dark");
        document.getElementById("console").classList.add("dark");
        document.getElementById("examples-container").classList.add("dark");
        try
        {
            document.getElementById("p5Canvas").classList.add("dark");
        }
        catch (error) { }

        localStorage['darkMode'] = 'true';
    }
    else
    {
        // Set light mode
        darkModeButton.innerHTML = "Dark Mode: Off";
        document.getElementById("ide").classList.remove("dark");
        document.getElementById("editor").classList.remove("dark");
        document.getElementById("chuck-nav").classList.remove("dark");
        document.getElementById("canvas").classList.remove("dark");
        document.getElementById("console").classList.remove("dark");
        document.getElementById("examples-container").classList.remove("dark");
        try
        {
            document.getElementById("p5Canvas").classList.remove("dark");
        }
        catch (error) { }

        localStorage['darkMode'] = 'false';
    }
};
var toggleDarkMode = function () { setDarkMode(darkMode = !darkMode); };
darkModeButton.addEventListener("click", toggleDarkMode);

/* Toggle ChucK now visibility */
var chuckNowMode = (localStorage['viewChuckNow'] === 'true') || false; // default state
var chuckNowButton = document.getElementById("chuckNowButton");
function setViewChuckNow(view)
{
    if (view)
    {
        // Set Chuck now visible
        chuckNowButton.innerHTML = "ChucK Time: On";
        document.getElementById("chuck-now").style.visibility = "visible";

        localStorage['viewChuckNow'] = 'true';
    }
    else
    {
        // Set Chuck now hidden
        chuckNowButton.innerHTML = "ChucK Time: Off";
        document.getElementById("chuck-now").style.visibility = "hidden";

        localStorage['viewChuckNow'] = 'false';
    }
};
var toggleChuckNow = function () { setViewChuckNow(chuckNowMode = !chuckNowMode); };
chuckNowButton.addEventListener("click", toggleChuckNow);

/* Save editor contents to chuck file */
var exportChuckButton = document.getElementById("exportChuckButton");
var exportChuckFile = function ()
{
    // Create a chuck file blob
    var chuckFile = chuckEditor.getValue();
    var chuckFileBlob = new Blob([chuckFile], { type: "text/plain" });
    window.URL = window.URL || window.webkitURL;
    var chuckFileURL = window.URL.createObjectURL(chuckFileBlob);
    // Create invisible download link
    var downloadLink = document.createElement("a");
    downloadLink.href = chuckFileURL;
    downloadLink.download = globalFileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    console.log("Exported chuck file");
};
exportChuckButton.addEventListener("click", exportChuckFile);

var chuckFileLoaded; // Promise to load chuck file
// RUN THIS ON STARTUP!!!
/* This will load in all cached values from localStorage or set defaults */
chuckFileLoaded = launchChuckFile();
setDarkMode(darkMode);
setVimMode(vimMode);
setViewChuckNow(chuckNowMode);

// Detect editor changes and save to cache
chuckEditor.on("change", function ()
{
    // Save chuck file to cache
    localStorage['chuckCache'] = chuckEditor.getValue();
    localStorage['chuckCacheName'] = globalFileName;
    localStorage['chuckCacheDate'] = new Date().toLocaleString();
    localStorage['chuckCacheExist'] = 'true';
    doesChuckCacheExist = true;
});
