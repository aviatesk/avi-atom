/** @babel */

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
    atom.workspace.open(TODO_LIST_PATH);
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
  atom.workspace.open(GITHUB_DRAFT_PATH);
});
atom.keymaps.add(
  'init.js', { 'atom-workspace': { 'ctrl-alt-shift-d': 'Avi-Atom:Open-GitHub-Draft' } }, 1,
);


/*
Tweak Hydrogen
*/

// Set Hydrogen keybinds
const hydrogenKeybinds = {
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
  'ctrl-c space': 'hydrogen:clear-result',
  'ctrl-c ctrl-space': 'hydrogen:clear-results',
};
const hydrogenMarkKeybinds = {
  'ctrl-c ctrl-d': 'hydrogen:run',
  'ctrl-c ctrl-b': 'hydrogen:run-and-move-down',
  'alt-ctrl-enter': 'hydrogen:run',
  'alt-shift-enter': 'hydrogen:run-and-move-down',
};

/**
 * Attaches Hydrogen keybinds to the current editor's scope
 */
function attachHydrogenCommands() {
  const editor = atom.workspace.getActiveTextEditor();
  const cursor = editor.getLastCursor();
  const { scopes } = cursor.getScopeDescriptor();
  const scope = scopes[0]; // Should be like `source.js
  if (scope) {
    // Attach Hydrogen's commands to the scope
    atom.keymaps.add('init.js', {
      [`atom-text-editor[data-grammar='${scope.replace('.', ' ')}'].emacs-plus:not([mini])`]: hydrogenKeybinds,
      [`atom-text-editor[data-grammar='${scope.replace('.', ' ')}'].emacs-plus.mark-mode:not([mini])`]: hydrogenMarkKeybinds,
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

// Attach Hydrogen keybindings to .jl/.jmd files
// @NOTE: These commands work as a fallback runner for Julia when Julia-Client is not activated
const hydrogenKeybindsForJulia = atom.keymaps.add(
  'init.js', {
    'atom-text-editor[data-grammar=\'source julia\'].emacs-plus:not([mini])': hydrogenKeybinds,
    'atom-text-editor[data-grammar=\'source weave md\'].emacs-plus:not([mini])': hydrogenKeybinds,
    'atom-text-editor[data-grammar=\'source julia\'].emacs-plus.mark-mode:not([mini])': hydrogenMarkKeybinds,
    'atom-text-editor[data-grammar=\'source weave md\'].emacs-plus.mark-mode:not([mini])': hydrogenMarkKeybinds,
  },
  1,
);

const juliaClientWatcher = atom.packages.onDidActivatePackage((pkg) => {
  if (pkg.name !== 'julia-client') return;

  // Dispose Hydrogen keybindings for Julia files
  hydrogenKeybindsForJulia.dispose();

  // Create custom Julia-Client commands
  atom.commands.add('atom-workspace', {
    // Restart Julia Process
    'julia-client:restart-julia': async () => {
      const element = atom.workspace.getElement();
      if (!element) return;
      await atom.commands.dispatch(element, 'julia-client:kill-julia');
      atom.commands.dispatch(element, 'julia-client:start-julia');
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
    'ctrl-c space': 'inline:clear-current',
    'ctrl-c ctrl-space': 'inline-results:clear-all',
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
      // eslint-disable-next-line no-console
      console.warning('Julia-Client: Failed to customize Tool-Bar integration');
      return;
    }
    const tb = toolBar.mainModule.provideToolBar()('julia-client');

    // Process
    tb.addButton({
      icon: 'flame',
      tooltip: 'Start Julia Process',
      callback: 'julia-client:start-julia',
    });
    tb.addButton({
      icon: 'globe',
      tooltip: 'Start Remote Julia Process',
      callback: 'julia-client:start-remote-julia-process',
    });
    tb.addButton({
      icon: 'zap',
      tooltip: 'Interrupt Julia Process',
      callback: 'julia-client:interrupt-julia',
    });
    tb.addButton({
      icon: 'sync',
      tooltip: 'Restart Julia Process',
      callback: 'julia-client:restart-julia',
    });
    tb.addButton({
      icon: 'trashcan',
      tooltip: 'Kill Julia Process',
      callback: 'julia-client:kill-julia',
    });

    tb.addSpacer();

    // In Process
    tb.addButton({
      icon: 'play',
      iconset: 'ion',
      tooltip: 'Run A Whole File',
      callback: 'julia-client:run-all',
    });
    tb.addButton({
      icon: 'format-float-none',
      iconset: 'mdi',
      tooltip: 'Format Code',
      callback: 'julia-client:format-code',
    });
    tb.addButton({
      icon: 'file-directory',
      tooltip: 'Set Working Directory',
      callback: 'julia-client:select-working-folder',
    });
    tb.addButton({
      icon: 'package',
      tooltip: 'Set Working Module',
      callback: 'julia-client:set-working-module',
    });

    tb.addSpacer();

    // Panes
    tb.addButton({
      icon: 'terminal',
      tooltip: 'Open Console Pane',
      callback: 'julia-client:open-console',
    });
    tb.addButton({
      icon: 'book',
      tooltip: 'Open Workspace Pane',
      callback: 'julia-client:open-workspace',
    });
    tb.addButton({
      icon: 'info',
      tooltip: 'Open Documentation Pane',
      callback: 'julia-client:open-documentation-browser',
    });
    tb.addButton({
      icon: 'graph',
      tooltip: 'Open Plot Pane',
      callback: 'julia-client:open-plot-pane',
    });
    tb.addButton({
      icon: 'bug',
      tooltip: 'Open Debugger Pane',
      callback: 'julia-debug:open-debugger-pane',
    });

    tb.addSpacer();

    // Meta
    tb.addButton({
      icon: 'gear',
      tooltip: 'Open Settings',
      callback: 'julia-client:settings',
    });
  }

  // Dispose this package watcher
  juliaClientWatcher.dispose();
});

/*
Use Atom-TypeScript for JavaScript files even for non-TypeScript projects
*/

let atomtsKeyBindings;
atom.packages.onDidActivateInitialPackages(() => {
  const atomts = atom.packages.getLoadedPackage('atom-typescript');
  if (!atomts) return;

  atom.commands.add('atom-workspace', {
    'typescript:activate-for-javascript': () => {
      // Activate Atom-TypeScript in very hacky way:
      // @NOTE: This change won't change the global config, that would provent Atom-TypeScript
      //        spawing TSL for JavaScript files in the other projects
      atomts.config.settings['atom-typescript'].allowJS = true;
      atom.packages.triggerActivationHook(atomts.getActivationHooks()[0]);
      atomtsKeyBindings = atom.keymaps.add(
        'init.js', {
          'atom-text-editor[data-grammar=\'source js\'].emacs-plus:not([mini])': {
            'ctrl-alt-r': 'typescript:rename-refactor',
            'ctrl-left': 'typescript:return-from-declaration',
            'ctrl-shift-left': 'typescript:show-editor-position-history',
          },
        },
        1,
      );
    },
    'typescript:deactivate-for-javascript': () => {
      atomts.config.settings['atom-typescript'].allowJS = false;
      if (atomtsKeyBindings) atomtsKeyBindings.dispose();
    },
  });
});

/*
Register extended commands for Git-Plus
*/

class InputView {
  constructor() {
    this.element = document.createElement('div');

    this.miniEditor = new TextEditor({ mini: true });
    this.miniEditor.element.addEventListener('blur', this.close.bind(this));

    this.message = document.createElement('div');
    this.element.appendChild(this.miniEditor.element);
    this.element.appendChild(this.message);

    this.panel = atom.workspace.addModalPanel({
      item: this,
      visible: false,
    });

    this.defaultCallbackOnConfirm = (_text) => {
      atom.notifications.addWarning('Avi-Atom: init.js', {
        details: '`InputView`\'s `open` method seems to be called without an argument',
        description: 'No callback is set !',
      });
    };
    this.callbackOnConfirm = this.defaultCallbackOnConfirm;

    atom.commands.add(this.miniEditor.element, 'core:confirm', () => {
      this.confirm();
    });
    atom.commands.add(this.miniEditor.element, 'core:cancel', () => {
      this.close();
    });
  }

  setCallbackOnConfirm(callback) {
    this.callbackOnConfirm = callback;
  }

  setPlaceholderText(placeholderText) {
    this.miniEditor.setPlaceholderText(placeholderText);
  }

  setMessageText(messageText) {
    this.message.textContent = messageText;
  }

  storeFocusedElement() {
    this.previouslyFocusedElement = document.activeElement;
    return this.previouslyFocusedElement;
  }

  /**
   * Sets `callbackOnConfirm` and then opens the input prompt input.
   *
   * @param callback {Function} - The callback function that would be called on confirm taking the
   *                              enterted input text.
   * @param messageText {String} - The message text of input mini editor
   * @param placeholderText {String} - The placeholer text of input mini editor
   * @param defaultText {String} - The default value of input text
   */
  open(
    callback = this.defaultCallbackOnConfirm,
    messageText = '',
    placeholderText = '',
    defaultText = null,
  ) {
    if (this.panel.isVisible()) return;

    this.setCallbackOnConfirm(callback);
    this.setMessageText(messageText);
    this.setPlaceholderText(placeholderText);
    if (defaultText) this.miniEditor.setText(defaultText);

    this.storeFocusedElement();
    this.panel.show();
    this.miniEditor.element.focus();
  }

  restoreFocus() {
    if (this.previouslyFocusedElement && this.previouslyFocusedElement.parentElement) {
      return this.previouslyFocusedElement.focus();
    }
    return atom.views.getView(atom.workspace).focus();
  }

  close() {
    if (!this.panel.isVisible()) return;
    this.miniEditor.setText('');
    this.setCallbackOnConfirm(this.defaultCallbackOnConfirm);
    this.setMessageText('');
    this.setPlaceholderText('');
    this.panel.hide();
    if (this.miniEditor.element.hasFocus()) {
      this.restoreFocus();
    }
  }

  confirm() {
    const text = this.miniEditor.getText();
    this.callbackOnConfirm(text);
    this.close();
  }
}

/**
 * Add custom commands to Git-Plus
 */
atom.packages.onDidActivateInitialPackages(() => {
  const gitPlus = atom.packages.getActivePackage('git-plus');
  const inputView = new InputView();
  if (gitPlus) {
    const gp = gitPlus.mainModule.provideService();

    gp.registerCommand('atom-workspace', 'git-plus:set-upstream', () => {
      gp.getRepo()
        .then((repo) => {
          inputView.open(
            (urlText) => {
              gp.run(repo, `remote add -f -m upstream/master upstream ${urlText}`)
                .then(() => {
                  atom.notifications.addInfo('Git-Plus: Set-Upstream', {
                    description: `Setting up 'upstream' branch tracking ${urlText} ...`,
                  });
                });
            },
            'Enter the URL of the remote repository to be tracked as the upstream',
            'E.g.: https://github.com/aviatesk/avi-atom.git',
          );
        });
    });

    gp.registerCommand('atom-workspace', 'git-plus:set-branch-upstream', () => {
      gp.getRepo()
        .then((repo) => {
          const branch = repo.branch.replace('refs/heads/', '');
          inputView.open(
            (branchNameText) => {
              gp.run(repo, `branch --set-upstream-to upstream/${branchNameText}`)
                .then(() => {
                  atom.notifications.addInfo('Git-Plus: Set-Branch-Upstream', {
                    description: `Setting up local branch '${branch}' to track remeote branch 'upstream/${branchNameText}' ...`,
                  });
                });
            },
            `Enter the name of branch from 'upstream' to be tracked by local branch '${branch}'`,
            'E.g.: master',
            'master',
          );
        });
    });

    gp.registerCommand('atom-workspace', 'git-plus:push-to-origin', () => {
      gp.getRepo()
        .then((repo) => {
          const branch = repo.branch.replace('refs/heads/', '');
          gp.run(repo, `push origin ${branch}`)
            .then(() => {
              atom.notifications.addInfo('Git-Plus: Push-To-Origin', {
                description: `Pushing to remote branch origin/'${branch}' ...`,
              });
            });
        });
    });

    gp.registerCommand('atom-workspace', 'git-plus:force-push-to-origin', () => {
      gp.getRepo()
        .then((repo) => {
          const branch = repo.branch.replace('refs/heads/', '');
          gp.run(repo, `push --force origin ${branch}`)
            .then(() => {
              atom.notifications.addInfo('Git-Plus: Force-Push-To-Origin', {
                description: `Force-pushing to remote branch origin/'${branch}' ...`,
              });
            });
        });
    });

    gp.registerCommand('atom-workspace', 'git-plus:rebase-interactive', () => {
      gp.getRepo()
        .then((repo) => {
          inputView.open(
            (numberText) => {
              gp.run(repo, `rebase -i HEAD~${numberText}`)
                .then(() => {
                  atom.notifications.addInfo('Git-Plus: Rebase-Interactive', {
                    description: `Rebasing HEAD for previouse ${numberText} commits ...`,
                  });
                });
            },
            'Enter the number of commits to be rebased',
            'E.g.: 3',
          );
        });
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
