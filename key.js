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
