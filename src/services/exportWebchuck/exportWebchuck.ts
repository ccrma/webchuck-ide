import Editor from '@/components/monaco/editor';

const exportWebchuckButton = document.querySelector<HTMLButtonElement>(
  '#exportWebchuck'
)!;

const exportWebchuckCancel: HTMLButtonElement = document.querySelector<HTMLButtonElement>('#export-cancel-btn')!;
const exportDialog: HTMLDialogElement = document.querySelector<HTMLDialogElement>('#export-modal')!;
const exportBtn: HTMLButtonElement = document.querySelector<HTMLButtonElement>('#export-btn')!;

export function initExport() {
  exportWebchuckButton.addEventListener('click', () => {
    exportWebchuck();
  });

  exportWebchuckCancel.addEventListener('click', () => {
    exportDialog.close();
  });

  exportDialog.addEventListener('click', (e: MouseEvent): any => e.target === exportDialog && exportDialog.close());

  exportBtn.addEventListener('click', async () => {
    let template = await (await fetch('templates/export.html')).text();

    const doc: Document = new DOMParser().parseFromString(template, 'text/html');
    doc.querySelector<HTMLScriptElement>('#chuck')!.textContent = Editor.getEditorCode();
    doc.querySelector<HTMLDivElement>('#description')!.textContent = document.querySelector<HTMLTextAreaElement>('#export-description')!.value;
    doc.querySelector<HTMLHeadingElement>('#name')!.textContent = document.querySelector<HTMLInputElement>('#export-name')!.value;
    doc.querySelector<HTMLHeadingElement>('#author')!.textContent = document.querySelector<HTMLInputElement>('#export-author')!.value;

    // Create blob
    const webchuckFileBlob = new Blob([doc.documentElement.outerHTML], { type: 'text/html' });
    window.URL = window.URL || window.webkitURL;
    const webchuckFileURL = window.URL.createObjectURL(webchuckFileBlob);
    // Create invisible download link
    const downloadLink = document.createElement('a');
    downloadLink.href = webchuckFileURL;
    downloadLink.download = 'index.html';
    downloadLink.click();

    document.querySelector<HTMLTextAreaElement>('#export-description')!.value = '';
    document.querySelector<HTMLInputElement>('#export-name')!.value = '';
    document.querySelector<HTMLInputElement>('#export-author')!.value = '';
  });
}

async function exportWebchuck() {
  exportDialog.showModal();
}
