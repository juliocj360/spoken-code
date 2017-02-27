let userName, password

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
}
