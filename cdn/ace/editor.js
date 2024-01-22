function newChuckEditor(divId, code="", readonly = false) {
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
    editor.setValue(code);

    return editor;
}