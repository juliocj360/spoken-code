atom.config.get('spoken-code.userName')
atom.config.get('spoken-code.password')

const apiInfo = {
  url: "https://stream.watsonplatform.net/text-to-speech/api"
}

atom.config.observe('spoken-code.userName', (newValue) => {
  newValue.length >= 1 ? apiInfo.username = newValue : atom.config.set('spoken-code.userName', " ")
})

atom.config.observe('spoken-code.password', (newValue) => {
  newValue.length >= 1 ? apiInfo.password = newValue : atom.config.set('spoken-code.password', " ")
})

module.exports = apiInfo
