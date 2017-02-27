'use babel';

const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1')
const fs = require('fs')
const apiInfo = require('../key.js')
const esprima = require('esprima')
const spokenCode = require('./spoken-code.js')
const { Emitter, CompositeDisposable } = require('atom')

let clipCount = 0
let textToBeRead = []

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
    fs.unlinkSync(__dirname + `/test${clipCount}.ogg`)
    this.element.remove()
  }

  getElement() {
    return this.element;
  }

  setText(text) {
    textToBeRead = []
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
      parseText(text)
        .then(response => {
          goodSyntax(this.element)
        })
        .catch(reason => {
          textToBeRead = ['Bad syntax.']
          goodSyntax(this.element)
        })
    }
  }
}

const goodSyntax = (el) => {
  const text = textToBeRead
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
      pushAnalyzer(tokenizer.body)
      resolve(tokenizer)
    }
    else {
      reject(tokenizer.body)
    }
  })
}

const audioLoader = () => {
  textToBeRead = []
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

const textToSpeech = new TextToSpeechV1(apiInfo)

const watsonPromise = (text) => {
  return new Promise((resolve, reject) => {
    const transcript = textToSpeech.synthesize({"text": text.toString(), "voice": "en-US_AllisonVoice"})
    transcript.on('error', () => {
      reject(transcript)
    })
    transcript.on('response', () => {
      resolve(transcript)
    })
    transcript.on('end', () => {
      const wordBox = document.getElementById('word-box')
      wordBox.textContent = ''
      const button = document.createElement('button')
      button.textContent = 'Speak Code to me'
      button.setAttribute('id', 'speak-button')
      button.style.textAlign = 'center'
      button.style.margin = 'auto'
      button.style.color = 'white'
      button.style.background = 'black'
      button.style.border = '0px'
      button.style.width = '150px'
      button.style.cursor = 'pointer'
      wordBox.appendChild(button)
      button.addEventListener('click', audioLoader)
    })
  })
}

const analyzer = (parsedArray) => {
  for (var i = 0; i < parsedArray.length; i++) {
    const seperatedBody = parsedArray[i]
    if (seperatedBody.type === 'VariableDeclaration') {
      let varString = variableAnalyzer(seperatedBody)
      return varString
    }
    else if (seperatedBody.type === 'ExpressionStatement') {
      let expString = expressionAnalyzer(seperatedBody)
      return expString
    }
    else if (seperatedBody.type === 'ForStatement') {
      let forStmtString = forStmtAnalyzer(seperatedBody)
      return forStmtString
    }
    else if (seperatedBody.type === 'Identifier') {
      let idString = idAnalyzer(seperatedBody)
      return idString
    }
    else if (seperatedBody.type === 'Literal') {
      let literalString = litAnalyzer(seperatedBody)
      return literalString
    }
    else if (seperatedBody.type === 'BinaryExpression') {
      let binaryString = binaryExpAnalyzer(seperatedBody)
      return binaryString
    }
    else if (seperatedBody.type === 'MemberExpression') {
      let memberExpString = memberExpAnalyzer(seperatedBody)
      return memberExpString
    }
    else if (seperatedBody.type === 'UpdateExpression') {
      let updateExpString = updateExpAnalyzer(seperatedBody)
      return updateExpString
    }
    else if (seperatedBody.type === 'AssignmentExpression') {
      let assignExpString = assignExpAnalyzer(seperatedBody)
      return assignExpString
    }
    else if (seperatedBody.type === 'BlockStatement') {
      let blockString = blockStmtAnalyzer(seperatedBody.body)
      return blockString
    }
    else if (seperatedBody.type === 'FunctionDeclaration') {
      let functionString = functionAnalyzer(seperatedBody)
      return functionString
    }
    else if (seperatedBody.type === 'ReturnStatement') {
      let returnString = returnAnalyzer(seperatedBody.argument)
      return returnString
    }
    else if (seperatedBody.type === 'ArrowFunctionExpression') {
      let arrowString = arrowAnalyzer(seperatedBody)
      return arrowString
    }
    else if (seperatedBody.type === 'IfStatement') {
      let ifStmtString = ifStmtAnalyzer(seperatedBody)
      return ifStmtString
    }
  }
}

const pushAnalyzer = (parsedArray) => {
  for (var i = 0; i < parsedArray.length; i++) {
    const seperatedBody = parsedArray[i]
    if (seperatedBody.type === 'VariableDeclaration') {
      let varString = variableAnalyzer(seperatedBody)
      textToBeRead.push(varString)
    }
    else if (seperatedBody.type === 'ExpressionStatement') {
      let expString = expressionAnalyzer(seperatedBody)
      textToBeRead.push(expString)
    }
    else if (seperatedBody.type === 'ForStatement') {
      let forStmtString = forStmtAnalyzer(seperatedBody)
      textToBeRead.push(forStmtString)
    }
    else if (seperatedBody.type === 'BlockStatement') {
      let blockStmtString = blockStmtAnalyzer(seperatedBody.body)
      textToBeRead.push(blockStmtString)
    }
    else if (seperatedBody.type === 'FunctionDeclaration') {
      let functionString = functionAnalyzer(seperatedBody)
      textToBeRead.push(functionString)
    }
    else if (seperatedBody.type === 'IfStatement') {
      let ifStmtString = ifStmtAnalyzer(seperatedBody)
      textToBeRead.push(ifStmtString)
    }
  }
  console.log(textToBeRead)
}

const ifStmtAnalyzer = (expression) => {
  let testString = analyzer([expression.test])
  let consequentString = analyzer([expression.consequent])
  if (expression.alternate === null) {
    let ifStmtString = `"If" statement declaration. Condition is ${testString}. If truthy, the following will be excuted. ${consequentString}`
    return ifStmtString
  }
  else if (expression.alternate.type === 'IfStatement') {
    let alternateString = analyzer([expression.alternate])
    let ifStmtString = `"If" statement declaration. Condition is ${testString}. If truthy, the following will be excuted. ${consequentString} Alternative ${alternateString}`
    return ifStmtString
  }
  else {
    let altString = analyzer([expression.alternate])
    let elseString = `"If" statement declaration. Condition is ${testString}. If truthy, the following will be excuted. ${consequentString} "Else" statement declaration. If no "If" statement is found to be truthy, the following will be excuted. ${altString}`
    return elseString
  }
}

const arrowAnalyzer = (expression) => {
  let functionName, paramsStrings
  expression.id ? functionName = 'function named ' + expression.id.name : functionName = 'an anonymous function'
  let blockString = blockStmtAnalyzer(expression.body.body)
  let paramNumber = expression.params.length
  if (paramNumber > 0) {
    paramsStrings = argAnalyzer(expression.params, 'Parameter')
  }
  else {
    paramsStrings = ''
  }
  let arrowString = `Declaring "${functionName}", passing ${paramNumber} parameters `
  let bodyString = `The Body consists of the following. ${blockString}`
  let arrowObj = {
    arrowString, paramsStrings, bodyString
  }
  return arrowObj
}

const assignExpAnalyzer = (expression) => {
  const analyzedOp = operatorAnalyzer(expression.operator)
  const { type, desc } = analyzedOp
  const { left, right } = expression
  const leftString = analyzer([left])
  const rightString = analyzer([right])
  const expString = type + leftString + desc + rightString
  return expString
}

const returnAnalyzer = (expression) => {
  let expString = analyzer([expression])
  let varString = `Return ${expString}. `
  return varString
}

const functionAnalyzer = (expression) => {
  let functionName, paramsStrings
  expression.id ? functionName = 'function named ' + expression.id.name : functionName = 'anonymous function'
  let blockString = blockStmtAnalyzer(expression.body.body)
  let paramNumber = expression.params.length
  if (paramNumber > 0) {
    paramsStrings = argAnalyzer(expression.params, 'Parameter')
  }
  else {
    paramsStrings = ''
  }
  let functionString = `Declaring "${functionName}" and passing ${paramNumber} parameters. ${paramsStrings} The Body consists of the following. ${blockString}`
  return functionString
}

const blockStmtAnalyzer = (array) => {
  let blockStmtString = []
  if (array.length > 0) {
    for (var i = 0; i < array.length; i++) {
      let analyzedString = analyzer([array[i]])
      blockStmtString.push(analyzedString)
    }
  }
  else {
    let emptyStmtString = 'Empty Block Statement '
    blockStmtString.push(emptyStmtString)
  }
  return blockStmtString.toString()
}

const forStmtAnalyzer = (seperatedBody) => {
  const { init, test, update, body } = seperatedBody
  let initString, testString, updateString, bodyString
  init ? initString = analyzer([init]) : initString = 'null'
  test ? testString = analyzer([test]) : testString = 'null'
  update ? updateString = analyzer([update]) : updateString = 'null'
  body ? bodyString = analyzer([body]) : bodyString = 'null'
  let forString = `"For" loop declaration. The Initialization is ${initString} The Condition is a ${testString} The Final Expression is ${updateString}. The Body consists of the following. ${bodyString}`
  return forString
}

const expressionAnalyzer = (seperatedBody) => {
  const { expression } = seperatedBody
  const { callee} = expression
  if (expression.type === 'CallExpression' && expression.callee.type === 'MemberExpression' ) {
    const method = callee.property.name
    const object = callee.object.name
    const argString = argAnalyzer(expression.arguments, 'Argument')
    const argCount = expression.arguments.length
    const callString = `Call of the \"${method}\" method on the \"${object}\" object and passing ${argCount} arguments. `
    const varString = callString + argString
    return varString
  }
  else if (expression.type === 'MemberExpression') {
    const memberExpString = memberExpAnalyzer(expression)
    return memberExpString
  }
  else if (expression.type === 'BinaryExpression') {
    const expString = binaryExpAnalyzer(expression)
    return expString
  }
  else if (expression.type === 'UpdateExpression') {
    const expString = updateExpAnalyzer(expression)
    return expString
  }
  else if (expression.type === 'Identifier') {
    const name = expression.name
    const identifierString = `identifier "${name}" `
    return identifierString
  }
  else if (expression.type === 'Literal') {
    const value = expression.value
    const type = typeof value
    const identifierString = `${type} value of "${value}" `
    return identifierString
  }
  else if (expression.type === 'CallExpression' && expression.callee.type === 'Identifier') {
    const name = callee.name
    const argCount = expression.arguments.length
    const argString = argAnalyzer(expression.arguments, 'Argument')
    const callString = `Call of the \"${name}\" function and passing ${argCount} arguments. `
    const varString = callString + argString
    return varString
  }
}

const updateExpAnalyzer = (expression) => {
  const idString = idAnalyzer(expression.argument)
  const analyzedOp = operatorAnalyzer(expression.operator)
  const updateString = `${analyzedOp.desc} ${idString}`
  return updateString
}

const memberExpAnalyzer = (expression) => {
  const propName = expression.property.name
  const obName = expression.object.name
  const memberString = `"${propName}" property of the "${obName}" object. `
  return memberString
}

const binaryExpAnalyzer = (expression) => {
  const analyzedOp = operatorAnalyzer(expression.operator)
  const { type, desc } = analyzedOp
  const { left, right } = expression
  const leftString = analyzer([left])
  const rightString = analyzer([right])
  const expString = type + leftString + desc + rightString
  return expString
}

const idAnalyzer = (expression) => {
  const name = expression.name
  const identifierString = `identifier "${name}"`
  return identifierString
}

const litAnalyzer = (expression) => {
  const value = expression.value
  const type = typeof value
  const identifierString = `${type} value of "${value}"`
  return identifierString
}

const callExpressionAnalyzer = (expression) => {
  const { callee } = expression
  const argCount = expression.arguments.length
  if (callee.type === 'Identifier') {
    const name = callee.name
    const callString = `Call of the \"${name}\" function, passing ${argCount} arguments `
    const argString = argAnalyzer(expression.arguments, 'Argument')
    const varString = { call: callString, args: argString }
    return varString
  }
}

const argAnalyzer = (array, type) => {
  let argArray = []
  if (array.length > 0) {
    for (var i = 0; i < array.length; i++) {
      const argNumber = i + 1
      const argString = analyzer([array[i]])
      const varString = `${type} ${argNumber} is the ${argString}. `
      argArray.push(varString)
    }
    return argArray
  }
  else {
    argArray = ''
    return argArray
  }
}

const variableAnalyzer = (seperatedBody) => {
  const kindOfVariable = (seperatedBody.kind === 'const') ? 'constant' : seperatedBody.kind
  for (var j = 0; j < seperatedBody.declarations.length; j++) {
    const declaration = seperatedBody.declarations[j]
    if (declaration.type === 'VariableDeclarator' && declaration.init.type === 'ObjectExpression') {
      const name = declaration.id.name
      const propertyCount = declaration.init.properties.length
      const obString = ` Object initializer with ${propertyCount} properties assigned to ${kindOfVariable} variable named "${name}". `
      const propString = propertiesAnalyzer(declaration.init.properties)
      const varString = obString + propString.toString()
      return varString
    }
    else if (declaration.type === 'VariableDeclarator' && declaration.init.type === 'CallExpression') {
      const callString = callExpressionAnalyzer(declaration.init)
      const name = declaration.id.name
      const varString = `${callString.call}and assigning the return value to the ${kindOfVariable} variable named "${name}". `
      let expString
      callString.args ? expString = varString + callString.args : expString = varString
      return expString
    }
    else if (declaration.type === 'VariableDeclarator' && declaration.init.type === 'ArrowFunctionExpression') {
      const name = declaration.id.name
      let arrowObj = analyzer([declaration.init])
      let {arrowString, paramsStrings, bodyString} = arrowObj
      let varString = `${arrowString} and assigning the return value to the ${kindOfVariable} variable named "${name}". ${paramsStrings} ${bodyString} `
      return varString
    }
    else if (declaration.type === 'VariableDeclarator') {
      const varString = varDeclarator(declaration, kindOfVariable)
      return varString
    }
  }
}

const varDeclarator = (declaration, kindOfVariable) => {
  const name = declaration.id.name
  const value = declaration.init.value
  const type = typeof value
  const varString = `${type} value of ${value} assigned to ${kindOfVariable} variable named "${name}". `
  return varString
}

const propertiesAnalyzer = (array) => {
  let propString = []
  for (var i = 0; i < array.length; i++) {
    if (!array[i].method) {
      const value = array[i].value.value
      const valueType = typeof value
      const key = array[i].key.name
      const propNumber = i + 1
      const varString = `Property ${propNumber} is a key value pair where the ${valueType} value of "${value}" is assigned to the key "${key}". `
      propString.push(varString)
    }
    else {
      const methodString = array[i].key.name + " is a method. "
      propString.push(varString)
    }
  }
  return propString
}

const operatorAnalyzer = (operator) => {
  let analyzedOp = {}
  switch (operator) {
    case '<':
      analyzedOp.desc = 'is less than '
      analyzedOp.type = 'Comparison Expression testing if '
      return analyzedOp
    case '>':
      analyzedOp.desc = 'is greater than '
      analyzedOp.type = 'Comparison Expression testing if '
      return analyzedOp
    case '<=':
      analyzedOp.desc = 'is less than or equal to '
      analyzedOp.type = 'Comparison Expression testing if '
      return analyzedOp
    case '>=':
      analyzedOp.desc = 'is greater than or equal to '
      analyzedOp.type = 'Comparison Expression testing if '
      return analyzedOp
    case '==':
      analyzedOp.desc = 'equality '
      analyzedOp.type = 'Comparison Expression testing if '
      return analyzedOp
    case '===':
      analyzedOp.desc = 'strict equality '
      analyzedOp.type = 'Comparison Expression testing if '
      return analyzedOp
    case '!=':
      analyzedOp.desc = 'inequality '
      analyzedOp.type = 'Comparison Expression testing if '
      return analyzedOp
    case '!==':
      analyzedOp.desc = 'strict inequality '
      analyzedOp.type = 'Comparison Expression testing if '
      return analyzedOp
    case '++':
      analyzedOp.desc = 'to increment'
      return analyzedOp
    case '--':
      analyzedOp.desc = 'to decrement'
      return analyzedOp
    case '+':
      analyzedOp.desc = ' plus '
      analyzedOp.type = ''
      return analyzedOp
    case '-':
      analyzedOp.desc = ' minus '
      analyzedOp.type = ''
      return analyzedOp
    case '*':
      analyzedOp.desc = ' multiply by '
      analyzedOp.type = ''
      return analyzedOp
    case '/':
      analyzedOp.desc = ' divide by '
      analyzedOp.type = ''
      return analyzedOp
    case '*':
      analyzedOp.desc = ' multiply by '
      analyzedOp.type = ''
      return analyzedOp
    case '%':
      analyzedOp.desc = ' remainder of '
      analyzedOp.type = ''
      return analyzedOp
    case '**':
      analyzedOp.desc = ' exponentiation by '
      analyzedOp.type = ''
      return analyzedOp
    case '+=':
      analyzedOp.desc = ' plus equals '
      analyzedOp.type = 'Assignment of '
      return analyzedOp
    case '-=':
      analyzedOp.desc = ' minus equals '
      analyzedOp.type = 'Assignment of '
      return analyzedOp
    default: return 'Case not found'
  }
}
