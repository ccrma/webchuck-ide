// import ace themes scripts
var modeChuckJS = document.createElement('script');
modeChuckJS.src = 'https://cdn.jsdelivr.net/gh/terryzfeng/webchuck-ide@main/cdn/ace/mode-chuck.js'
modeChuckJS.type = 'text/javascript';
modeChuckJS.charset = 'utf-8';
document.head.appendChild(modeChuckJS);

var themeChuckJS = document.createElement('script');
themeChuckJS.src = 'https://cdn.jsdelivr.net/gh/terryzfeng/webchuck-ide@main/cdn/ace/theme-chuck.js'
themeChuckJS.type = 'text/javascript';
themeChuckJS.charset = 'utf-8';
document.head.appendChild(themeChuckJS);

function newChuckEditor(divId, code = "", readonly = false) {
    const editor = ace.edit('editor');
    editor.setTheme('ace/theme/chuck');
    editor.session.setMode('ace/mode/chuck');
    editor.setOptions({
        fontSize: '14px',
        fontFamily: 'Monaco, Menlo, Consolas, \'Courier New\', monospace',
        cursorStyle: 'ace',
        useSoftTabs: true,
        showFoldWidgets: true,
        foldStyle: 'markbeginend',
        minLines: 5,
    });
    editor.container.style.lineHeight = 1.25;
    editor.renderer.updateFontSize();
    editor.session.setUseWrapMode(true);
    editor.setReadOnly(readonly);
    editor.setValue(code, 1);

    return editor;
}