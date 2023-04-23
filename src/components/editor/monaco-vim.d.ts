declare module 'monaco-vim' {
    import monaco from "./monacoLite";
  
    interface IVimOptions {
      /**
       * Whether to use block cursor or not.
       * Defaults to true.
       */
      useBlockCursor?: boolean;
  
      /**
       * Whether to highlight the current line or not.
       * Defaults to true.
       */
      highlightCurrentLine?: boolean;
  
      /**
       * Whether to highlight the search matches or not.
       * Defaults to true.
       */
      highlightSearchMatches?: boolean;
  
      // Add more options as needed...
    }
  
    interface IVim {
      /**
       * Initialize Vim mode on a Monaco editor instance.
       * @param editor The editor instance to initialize Vim mode on.
       * @param status The status bar element to show Vim mode on.
       */
      initVimMode(editor: monaco.editor.IStandaloneCodeEditor, status?: HTMLElement | null ): void;
  
      /**
       * Dispose Vim keybindings and commands from a Monaco editor instance.
       * @param editor The editor instance to dispose Vim from.
       */
      dispose(editor: monaco.editor.IStandaloneCodeEditor): void;
    }
  
    const vim: IVim;
  
    export = vim;
  }
  