'use babel';

import { TextEditor } from 'atom';


/*
Focus utility
*/

const workspaceCenter = atom.workspace.getCenter();
let lastCenterItem = workspaceCenter.getActivePaneItem();
let lastDock = atom.workspace.getRightDock();
let lastDockItem = lastDock.getActivePaneItem();
atom.workspace.onDidStopChangingActivePaneItem((item) => {
  const paneContainer = atom.workspace.paneContainerForItem(item);
  if (!paneContainer) return;
  const location = paneContainer.getLocation();
  if (location === 'center') {
    lastCenterItem = item;
  } else {
    lastDockItem = item;
    lastDock = paneContainer;
  }
});

atom.commands.add('atom-dock', 'avi-atom:focus-last-workspace-center-item', () => {
  const pane = workspaceCenter.paneForItem(lastCenterItem);
  if (pane) {
    pane.activate();
    pane.activateItem(lastCenterItem);
  }
});
atom.commands.add('atom-workspace', 'avi-atom:focus-last-dock-item', () => {
  const pane = lastDock.paneForItem(lastDockItem);
  if (pane) {
    pane.activate();
    pane.activateItem(lastDockItem);
  }
});


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
Tweak Julia-Client
*/

atom.commands.add('atom-workspace', {
  // Restart Julia Process
  'julia-client:restart-julia': async () => {
    const element = atom.workspace.getElement();
    if (!element) return;
    await atom.commands.dispatch(element, 'julia-client:kill-julia');
    atom.commands.dispatch(element, 'julia-client:start-julia');
  },
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
      atom.config.set('atom-typescript.allowJS', true);
      // Activate Atom-TypeScript
      atom.packages.triggerActivationHook(atomts.getActivationHooks()[0]);
      atomtsKeyBindings = atom.keymaps.add(
        'init.js', {
          'atom-text-editor[data-grammar=\'source js\'].emacs-plus:not([mini])': {
            'ctrl-alt-r': 'typescript:rename-refactor',
            'ctrl-shift-left': 'typescript:return-from-declaration',
            'ctrl-shift-right': 'typescript:show-editor-position-history',
          },
        },
        1,
      );
    },
    'typescript:deactivate-for-javascript': () => {
      atom.config.set('atom-typescript.allowJS', false);
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
