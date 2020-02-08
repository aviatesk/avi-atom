/** @babel */

import { TextEditor } from 'atom';


export default class InputView {
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
