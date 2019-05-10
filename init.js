'use babel';

import { TextEditor } from 'atom';

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

// Add custom commands to Git-Plus
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

const hydrogenCommands = {
  'ctrl-c ctrl-c': 'hydrogen:run',
  'ctrl-c ctrl-n': 'hydrogen:run-and-move-down',
  'ctrl-c ctrl-d': 'hydrogen:run-cell',
  'ctrl-c ctrl-b': 'hydrogen:run-cell-and-move-down',
  'ctrl-c ctrl-r': 'hydrogen:run-all',
  'ctrl-enter': 'hydrogen:run',
  'shift-enter': 'hydrogen:run-and-move-down',
  'ctrl-shift-enter': 'hydrogen:run-and-move-down',
  'alt-enter': 'hydrogen:run-cell',
  'alt-shift-enter': 'hydrogen:run-cell-and-move-down',
  'ctrl-alt-shift-enter': 'hydrogen:run-all',
  'alt-i': 'hydrogen:toggle-inspector',
  'alt-o': 'hydrogen:toggle-output-area',
  'alt-k': 'hydrogen:toggle-kernel-monitor',
};
const hydrogenMarkCommands = {
  'ctrl-c ctrl-c': 'hydrogen:run',
  'ctrl-c ctrl-n': 'hydrogen:run-and-move-down',
  'ctrl-c ctrl-d': 'hydrogen:run',
  'ctrl-c ctrl-b': 'hydrogen:run-and-move-down',
  'ctrl-enter': 'hydrogen:run',
  'shift-enter': 'hydrogen:run-and-move-down',
  'ctrl-shift-enter': 'hydrogen:run-and-move-down',
  'alt-enter': 'hydrogen:run',
  'alt-shift-enter': 'hydrogen:run-and-move-down',
};

// Mimic Hydrogen's keybindings
const juliaClientCommands = {
  'ctrl-c ctrl-c': 'julia-client:run-block',
  'ctrl-c ctrl-n': 'julia-client:run-and-move',
  'ctrl-c ctrl-d': 'julia-client:run-cell',
  'ctrl-c ctrl-b': 'julia-client:run-cell-and-move',
  'ctrl-c ctrl-r': 'julia-client:run-file',
  'ctrl-enter': 'julia-client:run-block',
  'shift-enter': 'julia-client:run-and-move',
  'ctrl-shift-enter': 'julia-client:run-and-move',
  'alt-enter': 'julia-client:run-cell',
  'alt-shift-enter': 'julia-client:run-cell-and-move',
  'ctrl-alt-shift-enter': 'julia-client:run-file',
  'alt-o': 'julia-client:open-console',
  'alt-i': 'julia-client:show-documentation',
};
const juliaClientMarkCommands = {
  'ctrl-c ctrl-c': 'julia-client:run-block',
  'ctrl-c ctrl-n': 'julia-client:run-and-move',
  'ctrl-c ctrl-d': 'julia-client:run-block',
  'ctrl-c ctrl-b': 'julia-client:run-and-move',
  'ctrl-c ctrl-r': 'hydrogen:run-file',
  'ctrl-enter': 'julia-client:run-block',
  'shift-enter': 'julia-client:run-and-move',
  'ctrl-shift-enter': 'julia-client:run-and-move',
  'alt-enter': 'julia-client:run-block',
  'alt-shift-enter': 'julia-client:run-and-move',
  'ctrl-alt-shift-enter': 'julia-client:run-file',
};

// Attach Julia-Client's commands to Julia files when it's loaded, use Hydrogen instead if not
atom.packages.onDidActivateInitialPackages(() => {
  if (atom.packages.isPackageLoaded('julia-client')) {
    console.log('Julia: Use Julia-Client');
    atom.keymaps.add(
      'init.js', {
        'atom-text-editor[data-grammar=\'source julia\'].emacs-plus:not([mini])': juliaClientCommands,
        'atom-text-editor[data-grammar=\'source weave md\'].emacs-plus:not([mini])': juliaClientCommands,
        'atom-text-editor[data-grammar=\'source julia\'].emacs-plus.mark-mode:not([mini])': juliaClientMarkCommands,
        'atom-text-editor[data-grammar=\'source weave md\'].emacs-plus.mark-mode:not([mini])': juliaClientMarkCommands,
      },
      1,
    );
  } else {
    console.log('Julia: Use Hydrogen');
    atom.keymaps.add(
      'init.js', {
        'atom-text-editor[data-grammar=\'source julia\'].emacs-plus:not([mini])': hydrogenCommands,
        'atom-text-editor[data-grammar=\'source weave md\'].emacs-plus:not([mini])': hydrogenCommands,
        'atom-text-editor[data-grammar=\'source julia\'].emacs-plus.mark-mode:not([mini])': hydrogenMarkCommands,
        'atom-text-editor[data-grammar=\'source weave md\'].emacs-plus.mark-mode:not([mini])': hydrogenMarkCommands,
      },
      1,
    );
  }
});

/**
 * Attaches Hydrogen commands to the current editor's scope
 */
function attachHydrogenCommands() {
  const editor = atom.workspace.getActiveTextEditor();
  const cursor = editor.getLastCursor();
  const { scopes } = cursor.getScopeDescriptor();
  const scope = scopes[0];
  if (scope) { // Should be like `source.js
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
