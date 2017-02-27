const apiInfo = {
  url: "https://stream.watsonplatform.net/text-to-speech/api"
}

atom.config.observe('spoken-code.userName', (newValue) => {
  if (newValue.length < 1) {
    apiInfo.username = ' '
  }
  else {
    apiInfo.username = newValue
  }
})

atom.config.observe('spoken-code.password', (newValue) => {
  if (newValue.length < 1) {
    apiInfo.password = ' '
  }
  else {
    apiInfo.password = newValue
  }
})

console.log(apiInfo)

module.exports = apiInfo
