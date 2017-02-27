const config = {
  url: "https://stream.watsonplatform.net/text-to-speech/api"
}

config.username = atom.config.get('spoken-code.userName', (newValue) => {
  return newValue
})

config.password = atom.config.get('spoken-code.password', (newValue) => {
  return newValue
})

module.exports = config
/*
atom.config.observe('spoken-code.userName', (newValue) => {
  userName = newValue
})

atom.config.observe('spoken-code.password', (newValue) => {
  password = newValue
})

module.exports = {
  "url": "https://stream.watsonplatform.net/text-to-speech/api",
  "username": userName,
  "password": password
} */

/*
let userName = atom.config.get('spoken-code.userName', (newValue) => {
  return newValue
})

let password = atom.config.get('spoken-code.password', (newValue) => {
  return newValue
})

const config = {
  "url": "https://stream.watsonplatform.net/text-to-speech/api",
  "username": userName,
  "password": password
}
*/
