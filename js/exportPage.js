// Get form
let form = document.getElementById("exportWebChuckPageForm");
const formGroups = form.getElementsByClassName("form-group");
const inputs = form.getElementsByClassName("form-input");

/* Save editor contents to chuck file */
var exportWebChuckButton = document.getElementById("exportWebChuckButton");
exportWebChuckButton.addEventListener("click", function () {
    location.replace("#exportWebChuckPage");
    history.replaceState({}, "", "#");
});

var submitExport = document.getElementById("submitExport");
var exportWebChuckPage = async function ()
{
    // Fetch template
    let template = await ( await fetch("template/isoRhythm/index.html")).text();
    // fill in template with information
    template = template.replace("${TITLE}", inputs[0].value);
    template = template.replace("${NAME}", inputs[1].value);
    template = template.replace("${DESCRIPTION}", inputs[2].value);
    template = template.replace("${CODE}", chuckEditor.getValue());
    console.log(template);

    var webchuckFileBlob = new Blob([template], { type: "text/plain" });
    window.URL = window.URL || window.webkitURL;
    var webchuckFileURL = window.URL.createObjectURL(webchuckFileBlob);
    // Create invisible download link
    var downloadLink = document.createElement("a");
    downloadLink.href = webchuckFileURL;
    downloadLink.download = "index.html";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};
submitExport.addEventListener("click", exportWebChuckPage);


// Cache form input
function cacheInput(e) {
    sessionStorage.setItem(e.attributes["id"].value, e.value)
}

// Load cached form input
for (let i = 0; i < inputs.length; i++) {
    console.log(i)
    let el = inputs[i];
    let cachedVal = sessionStorage.getItem(el.attributes["id"].value)
    console.log(cachedVal)
    if (cachedVal != null) {
        el.value = cachedVal;
    }
}