const apiInfo = {
  url: "https://stream.watsonplatform.net/text-to-speech/api"
}

atom.config.observe('spoken-code.userName', (newValue) => {
  newValue.length < 1 ? apiInfo.username = ' ' : apiInfo.username = newValue
})

atom.config.observe('spoken-code.password', (newValue) => {
  newValue.length < 1 ? apiInfo.password = ' ' : apiInfo.password = newValue
})

module.exports = apiInfo
