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
    else if (seperatedBody.type === 'FunctionDeclaration' || seperatedBody.type === 'FunctionExpression' ) {
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
    else if (seperatedBody.type === 'SwitchStatement') {
      let switchStmtString = switchAnalyzer(seperatedBody)
      return switchStmtString
    }
    else if (seperatedBody.type === 'ArrayExpression') {
      let arrayString = arrayAnalyzer(seperatedBody)
      return arrayString
    }
  }
}

const arrayAnalyzer = (expression) => {
  let { elements } = expression
  if (elements.length === 0) {
    return 'empty array object'
  }
  let initString = `Array object with ${elements.length} elements. `
  let elementsString = [initString]
  for (var i = 0; i < elements.length; i++) {
    let elementCount = i + 1
    let elString = analyzer([elements[i]])
    let varString = `Element ${elementCount} is ${elString}. `
    elementsString.push(varString)
  }
  return elementsString.toString()
}

const switchAnalyzer = (expression) => {
  let evalExpression = analyzer([expression.discriminant])
  let caseCount = expression.cases.length
  let caseString = caseAnalyzer(expression.cases)
  let switchString = `Switch statement declaration evaluating ${evalExpression} against ${caseCount} cases. ${caseString}`
  return switchString
}

const caseAnalyzer = (array) => {
  let stmtString = []
  for (var i = 0; i < array.length; i++) {
    let caseCount = i + 1
    let consequentString = analyzer(array[i].consequent)
    if (!!array[i].test) {
      let testCase = analyzer([array[i].test])
      let caseString = `Case number ${caseCount} evaluates against ${testCase}. If match, the following is executed: ${consequentString}`
      stmtString.push(caseString)
    }
    else {
      let defaultString = `Case number ${caseCount} is the default. if no match, the following will be executed: ${consequentString}`
      stmtString.push(defaultString)
    }
  }
  return stmtString
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
  functionName = 'an anonymous function'
  let blockString = blockStmtAnalyzer(expression.body.body)
  let paramNumber = expression.params.length
  if (paramNumber > 0) {
    paramsStrings = argAnalyzer(expression.params, 'Parameter')
  }
  else {
    paramsStrings = ''
  }
  let arrowString = `Declaring "${functionName}", passing ${paramNumber} parameters`
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
  bodyString = analyzer([body])
  let forString = `"For" loop declaration. The Initialization is ${initString} The Condition is a ${testString} The Final Expression is ${updateString}. The Body consists of the following. ${bodyString}`
  return forString
}

const expressionAnalyzer = (seperatedBody) => {
  const { expression } = seperatedBody
  const { callee } = expression
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
  else if (expression.type === 'AssignmentExpression') {
    const expString = analyzer([expression])
    return expString
  }
  else if (expression.type === 'Identifier') {
    const name = expression.name
    const identifierString = `identifier "${name}"`
    return identifierString
  }
  else if (expression.type === 'Literal') {
    const value = expression.value
    const type = typeof value
    const identifierString = `${type} value of "${value}"`
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
  else {
    let varString = analyzer([expression])
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
      if (array[i].type === 'ArrowFunctionExpression') {
        let paramsStrings = ''
        let paramNumber = array[i].params.length
        let blockString = blockStmtAnalyzer(array[i].body.body)
        let bodyString = `The anonymous function's body consists of the following. ${blockString}`
        if (paramNumber >= 1) {
          paramsStrings = argAnalyzer(array[i].params, 'Parameter')
        }
        let varString = `${type} ${argNumber} is an anonymous function with ${paramNumber} parameters. ${paramsStrings} ${bodyString}`
        argArray.push(varString)
      }
      else {
        const argString = analyzer([array[i]])
        const varString = `${type} ${argNumber} is the ${argString}. `
        argArray.push(varString)
      }
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
    if (declaration.type === 'VariableDeclarator' && (!declaration.init)) {
      let name = declaration.id.name
      let varString = `${kindOfVariable} variable named "${name}" declared.`
      return varString
    }
    else if (declaration.type === 'VariableDeclarator' && declaration.init.type === 'ObjectExpression') {
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
    else if (declaration.type === 'VariableDeclarator' && declaration.init.type === 'ArrayExpression') {
      let name = declaration.id.name
      if (declaration.init.elements.length === 0) {
        return `Empty array object assigned to the ${kindOfVariable} variable named "${name}".`
      }
      let arrayString = analyzer([declaration.init])
      let varString = `${arrayString} The array object is assigned to the ${kindOfVariable} variable named "${name}".`
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
      propString.push(methodString)
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
    case '%':
      analyzedOp.desc = ' remainder of '
      analyzedOp.type = ''
      return analyzedOp
    case '**':
      analyzedOp.desc = ' exponentiation by '
      analyzedOp.type = ''
      return analyzedOp
    case '=':
      analyzedOp.desc = ' to '
      analyzedOp.type = 'Assignment of '
      return analyzedOp
    case '+=':
      analyzedOp.desc = ' plus equals '
      analyzedOp.type = 'Addition Assignment of '
      return analyzedOp
    case '-=':
      analyzedOp.desc = ' minus equals '
      analyzedOp.type = 'Subtraction Assignment of '
      return analyzedOp
    case '*=':
      analyzedOp.desc = ' multiply equals '
      analyzedOp.type = 'Multiplication Assignment of '
      return analyzedOp
    case '/=':
      analyzedOp.desc = ' divide equals '
      analyzedOp.type = 'Division Assignment of '
      return analyzedOp
    case '%=':
      analyzedOp.desc = ' remainder equals '
      analyzedOp.type = 'Remainder Assignment of '
      return analyzedOp
    case '**=':
      analyzedOp.desc = ' exponentiation equals '
      analyzedOp.type = 'Exponentiation Assignment of '
      return analyzedOp
    case '<<=':
      analyzedOp.desc = ' to '
      analyzedOp.type = 'Left shift Assignment of '
      return analyzedOp
    case '>>=':
      analyzedOp.desc = ' to '
      analyzedOp.type = 'Right shift Assignment of '
      return analyzedOp
    case '>>>=':
      analyzedOp.desc = ' to '
      analyzedOp.type = 'Unsigned right shift Assignment of '
      return analyzedOp
    case '&=':
      analyzedOp.desc = ' to '
      analyzedOp.type = 'Bitwise AND Assignment of '
      return analyzedOp
    case '^=':
      analyzedOp.desc = ' to '
      analyzedOp.type = 'Bitwise XOR Assignment of '
      return analyzedOp
    case '|=':
      analyzedOp.desc = ' to '
      analyzedOp.type = 'Bitwise OR Assignment of '
      return analyzedOp
  }
}

const pushAnalyzer = (parsedArray) => {
  let textToBeRead = []
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
    else if (seperatedBody.type === 'SwitchStatement') {
      let switchStmtString = switchAnalyzer(seperatedBody)
      textToBeRead.push(switchStmtString)
    }
  }
  return textToBeRead
}

module.exports = pushAnalyzer