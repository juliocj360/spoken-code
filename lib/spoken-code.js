'use babel';

import SpokenCodeView from './spoken-code-view';
import { CompositeDisposable } from 'atom';

export default {

  spokenCodeView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.spokenCodeView = new SpokenCodeView(state.spokenCodeViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.spokenCodeView.getElement(),
      visible: false
    });

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'Spoken Code:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.spokenCodeView.destroy();
  },

  toggle() {
    const editor = atom.workspace.getActiveTextEditor()
    if (this.modalPanel.isVisible()) {
      this.modalPanel.hide()
    }
    else {
      let words = editor.getSelectedText()
      this.spokenCodeView.setText(words)
      this.modalPanel.show()
    }
  }
};
