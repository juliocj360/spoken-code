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

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'spoken-code:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.spokenCodeView.destroy();
  },

  serialize() {
    return {
      spokenCodeViewState: this.spokenCodeView.serialize()
    };
  },

  toggle() {
    console.log('SpokenCode was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
