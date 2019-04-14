const { TextEditor } = require('atom');

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

  open() {
    if (this.panel.isVisible()) return;
    this.storeFocusedElement();
    this.panel.show();
    this.miniEditor.element.focus();
  }

  close() {
    if (!this.panel.isVisible()) return;
    this.miniEditor.setText('');
    this.panel.hide();
    if (this.miniEditor.element.hasFocus()) {
      this.restoreFocus();
    }
  }

  confirm() {
    /* The subclass will overwrite this method to achieve the expected action */
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
    }
    this.close();
  }
}

atom.packages.onDidActivateInitialPackages(() => {
  /**
   * Git-Plus custom commands
   * For rebasing commits
   */
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
