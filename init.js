'use babel';

import { TextEditor } from 'atom';


/*
Create an easy access to my TODO-list
*/

const TODO_LIST_PATH = 'C:\\Users\\aviat\\todo.md';
atom.packages.onDidActivateInitialPackages(() => {
  const isSpellCheckActivated = atom.packages.isPackageActive('spell-check');
  let subscription = null;
  let disableSpellCheck = !!isSpellCheckActivated;
  atom.workspace.observeActiveTextEditor(async (editor) => {
    if (editor && editor.getPath() === TODO_LIST_PATH) {
      // Disable Spell-Check for this TODO-list
      if (disableSpellCheck) {
        await atom.commands.dispatch(editor.getElement(), 'spell-check:toggle');
        disableSpellCheck = false;
      }
      // Show the TODO-list only within this file
      await atom.commands.dispatch(editor.getElement(), 'todo-show:find-in-active-file');
      // Back to usual TODO-Show state
      subscription = atom.workspace.onDidChangeActiveTextEditor((_item) => {
        atom.commands.dispatch(atom.workspace.getElement(), 'todo-show:find-in-workspace');
        subscription.dispose(); // Dispose this subscription
      });
      // Turn `disableSpellCheck` back to `true` when the TODO-list is destroyed
      editor.onDidDestroy(() => {
        disableSpellCheck = !!isSpellCheckActivated;
      });
    }
  });
  atom.commands.add('atom-workspace', 'Avi-Atom:Open-TODO-List', async () => {
    await atom.workspace.open(TODO_LIST_PATH);
  });
  atom.keymaps.add(
    'init.js', { 'atom-workspace': { 'ctrl-alt-shift-t': 'Avi-Atom:Open-TODO-List' } }, 1,
  );
});


/*
Create an easy access to my TODO-list
*/

const GITHUB_DRAFT_PATH = 'C:\\Users\\aviat\\_draft.md';
atom.commands.add('atom-workspace', 'Avi-Atom:Open-GitHub-Draft', async () => {
  await atom.workspace.open(GITHUB_DRAFT_PATH);
});
atom.keymaps.add(
  'init.js', { 'atom-workspace': { 'ctrl-alt-shift-d': 'Avi-Atom:Open-GitHub-Draft' } }, 1,
);


/*
Tweak Hydrogen
*/

// Set Hydrogen commands
const hydrogenCommands = {
  'ctrl-c ctrl-c': 'hydrogen:run',
  'ctrl-c ctrl-n': 'hydrogen:run-and-move-down',
  'ctrl-c ctrl-d': 'hydrogen:run-cell',
  'ctrl-c ctrl-b': 'hydrogen:run-cell-and-move-down',
  'ctrl-c ctrl-r': 'hydrogen:run-all',
  'ctrl-enter': 'hydrogen:run',
  'shift-enter': 'hydrogen:run-and-move-down',
  'alt-ctrl-enter': 'hydrogen:run-cell',
  'alt-shift-enter': 'hydrogen:run-cell-and-move-down',
  'ctrl-alt-shift-enter': 'hydrogen:run-all',
  'alt-i': 'hydrogen:toggle-inspector',
  'alt-k ctrl-s': 'hydrogen:start-local-kernel',
  'alt-k ctrl-c': 'hydrogen:interrupt-kernel',
  'alt-k ctrl-k': 'hydrogen:shutdown-kernel',
  'alt-k ctrl-r': 'hydrogen:restart-kernel',
};
const hydrogenMarkCommands = {
  'ctrl-c ctrl-d': 'hydrogen:run',
  'ctrl-c ctrl-b': 'hydrogen:run-and-move-down',
  'alt-ctrl-enter': 'hydrogen:run',
  'alt-shift-enter': 'hydrogen:run-and-move-down',
};

/**
 * Attaches Hydrogen commands to the current editor's scope
 */
function attachHydrogenCommands() {
  const editor = atom.workspace.getActiveTextEditor();
  const cursor = editor.getLastCursor();
  const { scopes } = cursor.getScopeDescriptor();
  const scope = scopes[0]; // Should be like `source.js
  if (scope) {
    // Attach Hydrogen's commands to the scope
    atom.keymaps.add('init.js', {
      [`atom-text-editor[data-grammar='${scope.replace('.', ' ')}'].emacs-plus:not([mini])`]: hydrogenCommands,
      [`atom-text-editor[data-grammar='${scope.replace('.', ' ')}'].emacs-plus.mark-mode:not([mini])`]: hydrogenMarkCommands,
    });
  } else {
    atom.notifications.add('Hydrogen', {
      descrition: 'Can\'t find any scope',
    });
  }
}
atom.commands.add('atom-text-editor', 'hydrogen:attach-commands-to-current-scope', () => {
  attachHydrogenCommands();
});


/*
Tweak Julia-Client & Tool-Bar
*/

atom.packages.onDidActivateInitialPackages(() => {
  // Attach Julia-Client's commands to Julia files when it's loaded, if not, use Hydrogen instead
  if (!atom.packages.isPackageLoaded('julia-client')) {
    console.log('Julia: Use Hydrogen');
    // Attach Hydrogen commands to .jl/.jmd files
    // Hydrogen works as a fallback runner for Julia
    atom.keymaps.add(
      'init.js', {
        'atom-text-editor[data-grammar=\'source julia\'].emacs-plus:not([mini])': hydrogenCommands,
        'atom-text-editor[data-grammar=\'source weave md\'].emacs-plus:not([mini])': hydrogenCommands,
        'atom-text-editor[data-grammar=\'source julia\'].emacs-plus.mark-mode:not([mini])': hydrogenMarkCommands,
        'atom-text-editor[data-grammar=\'source weave md\'].emacs-plus.mark-mode:not([mini])': hydrogenMarkCommands,
      },
      1,
    );
  } else {
    console.log('Julia: Use Julia-Client');

    // Create custom Julia-Client commands
    atom.commands.add('atom-workspace', {
      /**
       * Restart Julia Process
       */
      'julia-client:restart-julia': async () => {
        const element = atom.workspace.getElement();
        if (!element) return;
        await atom.commands.dispatch(element, 'julia-client:kill-julia');
        atom.commands.dispatch(element, 'julia-client:start-julia');
      },
      /**
       * Dispatch appropriate command to run an whole .jl or .jmd file
       */
      'julia-client:run-all': () => {
        const editor = atom.workspace.getActiveTextEditor();
        if (!editor) return;
        const grammar = editor.getGrammar().scopeName;
        const element = editor.getElement();
        if (grammar === 'source.julia') {
          atom.commands.dispatch(element, 'julia-client:run-file');
        } else if (grammar === 'source.weave.md') {
          atom.commands.dispatch(element, 'julia-client:run-weave-chunks');
        }
      },
    });

    // Mimic Hydrogen's keybindings
    const juliaClientCommands = {
      'ctrl-c ctrl-c': 'julia-client:run-block',
      'ctrl-c ctrl-n': 'julia-client:run-and-move',
      'ctrl-c ctrl-d': 'julia-client:run-cell',
      'ctrl-c ctrl-b': 'julia-client:run-cell-and-move',
      'ctrl-c ctrl-r': 'julia-client:run-all',
      'ctrl-enter': 'julia-client:run-block',
      'shift-enter': 'julia-client:run-and-move',
      'alt-ctrl-enter': 'julia-client:run-cell',
      'alt-shift-enter': 'julia-client:run-cell-and-move',
      'ctrl-alt-shift-enter': 'julia-client:run-all',
      'alt-i': 'julia-client:show-documentation',
    };
    const juliaClientMarkCommands = {
      'ctrl-c ctrl-d': 'julia-client:run-block',
      'ctrl-c ctrl-b': 'julia-client:run-and-move',
      'alt-ctrl-enter': 'julia-client:run-block',
      'alt-shift-enter': 'julia-client:run-and-move',
    };
    // Attach Julia-Client commands to .jl/.jmd files
    atom.keymaps.add(
      'init.js', {
        'atom-workspace': { 'alt-j ctrl-r': 'julia-client:restart-julia' },
        'atom-text-editor[data-grammar=\'source julia\'].emacs-plus:not([mini])': juliaClientCommands,
        'atom-text-editor[data-grammar=\'source weave md\'].emacs-plus:not([mini])': juliaClientCommands,
        'atom-text-editor[data-grammar=\'source julia\'].emacs-plus.mark-mode:not([mini])': juliaClientMarkCommands,
        'atom-text-editor[data-grammar=\'source weave md\'].emacs-plus.mark-mode:not([mini])': juliaClientMarkCommands,
      },
      1,
    );

    // Tweak Tool-Bar integration if activated
    if (atom.packages.isPackageLoaded('tool-bar')) {
      const toolBar = atom.packages.getLoadedPackage('tool-bar');
      if (!toolBar) {
        console.log('Julia-Client: Failed to customize Tool-Bar integration');
        return;
      }
      const tb = toolBar.mainModule.provideToolBar()('avi-atom');

      // Process
      tb.addButton({
        icon: 'flame',
        callback: 'julia-client:start-julia',
        tooltip: 'Start Julia Process',
      });
      tb.addButton({
        icon: 'globe',
        callback: 'julia-client:start-remote-julia-process',
        tooltip: 'Start Remote Julia Process',
      });
      tb.addButton({
        icon: 'zap',
        callback: 'julia-client:interrupt-julia',
        tooltip: 'Interrupt Julia Process',
      });
      tb.addButton({
        icon: 'sync',
        callback: 'julia-client:restart-julia',
        tooltip: 'Restart Julia Process',
      });
      tb.addButton({
        icon: 'trashcan',
        callback: 'julia-client:kill-julia',
        tooltip: 'Kill Julia Process',
      });

      tb.addSpacer();

      // In Process

      tb.addButton({
        icon: 'play',
        callback: 'julia-client:run-all',
        tooltip: 'Run A Whole File',
        iconset: 'ion',
      });
      tb.addButton({
        icon: 'file-directory',
        callback: 'julia-client:select-working-folder',
        tooltip: 'Set Working Directory',
      });
      tb.addButton({
        icon: 'package',
        callback: 'julia-client:set-working-module',
        tooltip: 'Set Working Module',
      });

      tb.addSpacer();

      // Panes
      tb.addButton({
        icon: 'terminal',
        callback: 'julia-client:open-console',
        tooltip: 'Open Console Pane',
      });
      tb.addButton({
        icon: 'book',
        callback: 'julia-client:open-workspace',
        tooltip: 'Open Workspace Pane',
      });
      tb.addButton({
        icon: 'info',
        callback: 'julia-client:open-documentation-browser',
        tooltip: 'Open Documentation Pane',
      });
      tb.addButton({
        icon: 'graph',
        callback: 'julia-client:open-plot-pane',
        tooltip: 'Open Plot Pane',
      });
      tb.addButton({
        icon: 'bug',
        callback: 'julia-debug:open-debugger-pane',
        tooltip: 'Open Debugger Pane',
      });

      tb.addSpacer();

      // Meta

      tb.addButton({
        icon: 'gear',
        callback: 'julia-client:settings',
        tooltip: 'Open Settings',
      });
    }
  }
});


/*
Register extended commands for Git-Plus
*/

class InputView {
  constructor(placeholderText, messageText) {
    this.element = document.createElement('div');

    this.miniEditor = new TextEditor({ mini: true });
    this.miniEditor.element.addEventListener('blur', this.close.bind(this));
    this.miniEditor.setPlaceholderText(placeholderText);

    this.message = document.createElement('div');
    this.message.textContent = messageText;
    this.element.appendChild(this.miniEditor.element);
    this.element.appendChild(this.message);

    this.panel = atom.workspace.addModalPanel({
      item: this,
      visible: false,
    });

    atom.commands.add(this.miniEditor.element, 'core:confirm', () => {
      this.confirm();
    });
    atom.commands.add(this.miniEditor.element, 'core:cancel', () => {
      this.close();
    });
  }

  /**
   * Opens the input prompt in a mini text editor view.
   */
  open() {
    if (this.panel.isVisible()) return;
    this.storeFocusedElement();
    this.panel.show();
    this.miniEditor.element.focus();
  }

  /**
   * CLoses the opened mini text editor view and restores the original view.
   */
  close() {
    if (!this.panel.isVisible()) return;
    this.miniEditor.setText('');
    this.panel.hide();
    if (this.miniEditor.element.hasFocus()) {
      this.restoreFocus();
    }
  }

  /**
   * Confirms the input prompt.
   *
   * @usage A subclass will overwrite this method to achieve its own task.
   */
  confirm() {
    this.close();
  }

  storeFocusedElement() {
    this.previouslyFocusedElement = document.activeElement;
    return this.previouslyFocusedElement;
  }

  restoreFocus() {
    if (this.previouslyFocusedElement && this.previouslyFocusedElement.parentElement) {
      return this.previouslyFocusedElement.focus();
    }
    return atom.views.getView(atom.workspace).focus();
  }
}

class RebaseInputView extends InputView {
  constructor(placeholderText, messageText, gp) {
    super(placeholderText, messageText);
    this.gp = gp;
  }

  confirm() {
    const text = this.miniEditor.getText();
    if (parseInt(text, 10)) {
      this.gp.getRepo()
        .then((repo) => {
          this.gp.run(repo, 'rebase -i HEAD~'.concat(text));
        });
    } else {
      atom.notifications.addInfo('Git interactive rebasing info', {
        detail: 'Enter an interger !',
      });
    }
    this.close();
  }
}

/**
 * Add custom commands to Git-Plus
 */
atom.packages.onDidActivateInitialPackages(() => {
  const gitPlus = atom.packages.getActivePackage('git-plus');
  if (gitPlus) {
    const gp = gitPlus.mainModule.provideService();
    const rebaseInputView = new RebaseInputView('E.g.: 3', 'Enter the number of commits to be rebased', gp);

    gp.registerCommand('atom-workspace', 'git-plus:rebase-interactive', () => {
      rebaseInputView.open();
    });

    gp.registerCommand('atom-workspace', 'git-plus:rebase-continue', () => {
      gp.getRepo()
        .then((repo) => {
          gp.run(repo, 'rebase --continue');
        });
    });

    gp.registerCommand('atom-workspace', 'git-plus:rebase-abort', () => {
      gp.getRepo()
        .then((repo) => {
          gp.run(repo, 'rebase --abort');
        });
    });
  }
});
