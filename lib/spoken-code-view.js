'use babel';

const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1')
const fs = require('fs')
const apiInfo = require('../key.js')
const esprima = require('esprima')
const spokenCode = require('./spoken-code.js')
const { Emitter, CompositeDisposable } = require('atom')
const pushAnalyzer = require('./analyzer.js')

let clipCount = 0

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
    if (clipCount > 0) {
      fs.unlinkSync(__dirname + `/test${clipCount}.ogg`)
    }
  }

  getElement() {
    return this.element;
  }

  setText(text) {
    if (text.length === 0) {
      const displayText = 'Please make a selection'
      this.element.textContent = displayText
    }
    else if (text.length > 250) {
      const displayText = 'Please make a smaller selection'
      this.element.textContent = displayText
    }
    else {
      if (clipCount > 0) {
        fs.unlinkSync(__dirname + `/test${clipCount}.ogg`)
      }
      parseText(text)
        .then(response => {
          goodSyntax(this.element, response)
          console.log(response)
        })
        .catch(reason => {
          goodSyntax(this.element, ['Bad Syntax.'])
        })
    }
  }
}

const goodSyntax = (el, text) => {
  watsonPromise(text)
    .then(response => {
      const fileLoc = __dirname + `/test${clipCount}.ogg`
      const temp = fs.createWriteStream(fileLoc)
      response.pipe(temp)
    })
    .catch(reason => {
      clipCount -= 1
      console.log('Watson Error' + reason)
    })
  const displayText = 'Downloading audio...'
  el.textContent = displayText
  return 'ok'
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

const audioLoader = () => {
  const el = document.getElementById('word-box')
  const audio = document.createElement('audio')
  audio.style.display = 'none'
  el.appendChild(audio)
  const sourceTag = document.createElement('source')
  sourceTag.src = __dirname + `/test${clipCount}.ogg`
  audio.appendChild(sourceTag)
  audio.addEventListener('canplaythrough', () => {
    audio.play()
    spokenCode.default.toggle()
  })
}

const watsonPromise = (text) => {
  const textToSpeech = new TextToSpeechV1(apiInfo)
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
  return new Promise((resolve, reject) => {
    const transcript = textToSpeech.synthesize({"text": text.toString(), "voice": "en-US_AllisonVoice"}, (response) => {
      if (response !== null) {
        wordBox.textContent = ''
        button.textContent = 'Error: Check Text-to-Speech Credentials'
        wordBox.appendChild(button)
        button.addEventListener('click', () => {
          spokenCode.default.toggle()
        })
        console.log('error: ' + response)
        return response
      }
    })
    transcript.on('response', () => {
      clipCount += 1
      resolve(transcript)
    })
    transcript.on('end', () => {
      wordBox.textContent = ''
      button.textContent = 'Speak Code to Me'
      wordBox.appendChild(button)
      button.addEventListener('click', audioLoader)
    })
    transcript.on('error', (error) => {
      console.log('bad', error)
      reject(transcript)
    })
  })
}
