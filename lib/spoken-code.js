'use babel';

import SpokenCodeView from './spoken-code-view';
import { CompositeDisposable } from 'atom';

export default {

  config: {
    userName: {
      type: "string",
      description: "Please sign up for IBM's Bluemix Text-to-Speech API [here](https://console.ng.bluemix.net/catalog/services/text-to-speech/) and enter the details below.",
      default: "",
      order: 1
    },
    password: {
      type: "string",
      default: "",
      order: 2
    }
  },

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
