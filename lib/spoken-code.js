'use babel';

import SpokenCodeView from './spoken-code-view';
import { CompositeDisposable } from 'atom';

export default {

  spokenCodeView: null,
  modalPanel: null,
  subscriptions: null,
  config : {
    test: {
      title: 'test setting',
      description: 'test for setting 12',
      type: 'boolean',
      default: true
    }
  },

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
    if (this.modalPanel.isVisible()) {
      this.modalPanel.hide()
    }
    else {
      const editor = atom.workspace.getActiveTextEditor()
      editor.observeSelections(selection => {
        const range = selection.getScreenRange()
        const words = editor.getTextInBufferRange(range)
        this.spokenCodeView.setText(words)
        this.modalPanel.show()
      })
    }
  }
};
