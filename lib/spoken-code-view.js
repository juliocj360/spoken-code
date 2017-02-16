'use babel';

const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1')
const fs = require('fs')
const apiInfo = require('../key.js')
let clipCount = 0

export default class SpokenCodeView {

  constructor(serializedState) {
    this.element = document.createElement('div')
    this.element.classList.add('spoken-code')
    this.element.setAttribute('id', 'word-box')

    const message = document.createElement('div')
    message.classList.add('message')
    this.element.appendChild(message)
  }

  serialize() {}

  destroy() {
    fs.unlinkSync(__dirname + `/test${clipCount}.ogg`)
    this.element.remove()
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
      clipCount += 1
      watsonPromise(text)
        .then(response => {
          const fileLoc = __dirname + `/test${clipCount}.ogg`
          const temp = fs.createWriteStream(fileLoc)
          response.pipe(temp)
        })
      const displayText = ''
      this.element.textContent = displayText
      const button = document.createElement('button')
      button.textContent = 'Speak to me'
      this.element.appendChild(button)
      button.addEventListener('click', audioLoader)
    }
  }
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
  })
}

const textToSpeech = new TextToSpeechV1(apiInfo)

const watsonPromise = (text) => {
  return new Promise((resolve, reject) => {
    const transcript = textToSpeech.synthesize({"text": text})
    transcript.on('error', () => {
      reject(transcript)
    })
    transcript.on('response', () => {
      resolve(transcript)
    })
  })
}
