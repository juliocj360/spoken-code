'use babel';

const fs = require('fs')
const esprima = require('esprima')
const spokenCode = require('./spoken-code.js')
const { Emitter, CompositeDisposable } = require('atom')
const pushAnalyzer = require('./analyzer.js')

export default class SpokenCodeView {

  constructor(serializedState) {
    this.element = document.createElement('div')
    this.element.classList.add('spoken-code')
    this.element.setAttribute('id', 'word-box')
    this.element.style.margin = 'auto'
    this.element.style.textAlign = 'center'
    this.element.style.height = '20px'
    this.element.style.color = 'white'

    const message = document.createElement('div')
    message.classList.add('message')
    this.element.appendChild(message)
  }

  serialize() {}

  destroy() {
    this.element.remove()
  }

  getElement() {
    return this.element;
  }

  setText(text) {
    if (text.length === 0) {
      textToSpeech(['Please make a selection'])
    }
    else if (text.length > 500) {
      textToSpeech(['Please make a smaller selection'])
    }
    else {
      parseText(text)
        .then(response => {
          textToSpeech(response)
          console.log(response)
        })
        .catch(reason => {
          textToSpeech(['Bad Syntax.'])
        })
    }
  }
}

const parseText = (text) => {
  return new Promise((resolve, reject) => {
    const tokenizer = esprima.parse(text, {sourceType:'script'})
    if (tokenizer) {
      let analyzedString = pushAnalyzer(tokenizer.body)
      resolve(analyzedString)
    }
    else {
      reject(tokenizer.body)
    }
  })
}

const textToSpeech = (text) => {
  const wordBox = document.getElementById('word-box')
  const button = document.createElement('button')
  button.setAttribute('id', 'speak-button')
  button.style.textAlign = 'center'
  button.style.margin = 'auto'
  button.style.color = 'white'
  button.style.background = 'black'
  button.style.border = '0px'
  button.style.width = '250px'
  button.style.cursor = 'pointer'
  wordBox.textContent = ''
  button.textContent = 'Speak Code to Me'
  wordBox.appendChild(button)
  button.addEventListener('click', () => {
    let msg = new SpeechSynthesisUtterance();
    msg.text = text
    msg.onerror = (event) => {
      button.textContent = 'Error with Speech Conversion: ' + event.error
      button.addEventListener('click', () => {
        spokenCode.default.toggle()
      })
    }
    msg.onstart = () => {
      spokenCode.default.toggle()
    }
    speechSynthesis.speak(msg)
  })
}
