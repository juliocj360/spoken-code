const pushAnalyzer = require('../lib/analyzer.js')
const { expect } = require('chai')
const esprima = require('esprima')

const testExpression = [
  {
    desc: 'variable analyzer',
    should: 'correctly analyzes variable declaration',
    exp: 'var tester',
    res: 'var variable named "tester" declared.'
  },
  {
    desc: 'For Loop analyzer',
    should: 'correctly analyzes For Loop',
    exp: 'for (var i = 0; i < array.length; i++) {console.log(array[i])}',
    res: '"For" loop declaration. The Initialization is number value of 0 assigned to var variable named "i".  The Condition is a Comparison Expression testing if identifier "i"is less than "length" property of the "array" object.  The Final Expression is to increment identifier "i". The Body consists of the following. Call of the "log" method on the "console" object and passing 1 arguments. Argument 1 is the "i" property of the "array" object. . '
  },
  {
    desc: 'Arrow Function analyzer',
    should: 'correctly analyze Arrow Function',
    exp: 'var tester = () => {return "hello"}',
    res: 'Declaring "an anonymous function", passing 0 parameters and assigning the return value to the var variable named "tester".  The Body consists of the following. Return string value of "hello".  ',
  },
  {
    desc: 'Switch Statement analyzer',
    should: 'correctly analyze Switch Statement ',
    exp: 'switch (expression) {default: break}',
    res: 'Switch statement declaration evaluating identifier "expression" against 1 cases. Case number 1 is the default. if no match, the following will be executed: "Break" statement',
  },
  {
    desc: 'Arrow Function with Switch case analyzer',
    should: 'correctly analyze Arrow function with switch in body',
    exp: 'var tester = (expression) => {switch (expression) {case "oranges": return expression}}',
    res: 'Declaring "an anonymous function", passing 1 parameters and assigning the return value to the var variable named "tester". Parameter 1 is the identifier "expression".  The Body consists of the following. Switch statement declaration evaluating identifier "expression" against 1 cases. Case number 1 evaluates against string value of "oranges". If match, the following is executed: Return identifier "expression". .  ',
  },
  {
    desc: 'Block Statement analyzer',
    should: 'It should correctly analyze an empty block statement',
    exp: '{}',
    res: 'Empty Block Statement ',
  },
  {
    desc: 'Array Statement analyzer',
    should: 'It should correctly analyze an empty array ',
    exp: '[]',
    res: 'empty array object',
  },
  {
    desc: 'If stmt and empty For Loop analyzer',
    should: 'It should correctly analyze an If statement with and empty For loop',
    exp: 'if (tester) {for (;;) {}}',
    res: '"If" statement declaration. Condition is identifier "tester". If truthy, the following will be excuted. "For" loop declaration. The Initialization is null The Condition is a null The Final Expression is null. The Body consists of the following. Empty Block Statement ',
  },
  {
    desc: 'Object analyzer',
    should: 'It should correctly analyze an Object Initialization ',
    exp: 'let tester = {desc: "hello", test() {return "hello"}}',
    res: ' Object initializer with 2 properties assigned to let variable named "tester". Property 1 is a key value pair where the string value of "hello" is assigned to the key "desc". ,test is a method. ',
  },
  {
    desc: 'Array assigned to variable analyzer',
    should: 'It should correctly analyze an array with elements assigned to a const variable ',
    exp: 'const tester = ["test",true]',
    res: 'Array object with 2 elements. ,Element 1 is string value of "test". ,Element 2 is boolean value of "true".  The array object is assigned to the constant variable named "tester".',
  },
  {
    desc: 'Function declaration analyzer',
    should: 'It should correctly analyze a Function declaration',
    exp: 'function tester(test) {function test2() {console.log(test)}}',
    res: 'Declaring "function named tester" and passing 1 parameters. Parameter 1 is the identifier "test".  The Body consists of the following. Declaring "function named test2" and passing 0 parameters.  The Body consists of the following. Call of the "log" method on the "console" object and passing 1 arguments. Argument 1 is the identifier "test". ',
  },
  {
    desc: 'Arrow Function with param analyzer',
    should: 'It should correctly analyze an arow function with params',
    exp: 'const tester = (test) => {if (test) {test += 1}}',
    res: 'Declaring "an anonymous function", passing 1 parameters and assigning the return value to the constant variable named "tester". Parameter 1 is the identifier "test".  The Body consists of the following. "If" statement declaration. Condition is identifier "test". If truthy, the following will be excuted. Addition Assignment of identifier "test" plus equals number value of "1" ',
  },
  {
    desc: 'If statement analyzer',
    should: 'It should correctly analyze if statement with alternates ',
    exp: 'if (tester !== 0) {tester} else if (tester > 0) {hello} else {bad}',
    res: '"If" statement declaration. Condition is Comparison Expression testing if identifier "tester"strict inequality number value of "0". If truthy, the following will be excuted. identifier "tester" Alternative "If" statement declaration. Condition is Comparison Expression testing if identifier "tester"is greater than number value of "0". If truthy, the following will be excuted. identifier "hello" "Else" statement declaration. If no "If" statement is found to be truthy, the following will be excuted. identifier "bad"',
  },
  {
    desc: 'Call Expression with argument analyzer',
    should: 'It should correctly analyze a function call with one argument',
    exp: 'tester((test) => {console.log(test)})',
    res: 'Call of the "tester" function and passing 1 arguments. Argument 1 is an anonymous function with 1 parameters. Parameter 1 is the identifier "test".  The anonymous function\'s body consists of the following. Call of the "log" method on the "console" object and passing 1 arguments. Argument 1 is the identifier "test". ',
  },
  {
    desc: 'Call Expression analyzer',
    should: 'It should corectly analyze a call expression with one argument',
    exp: 'let tester = test("hello")',
    res: 'Call of the "test" function, passing 1 arguments and assigning the return value to the let variable named "tester". Argument 1 is the string value of "hello". ',
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator <= ',
    exp: 'i <= 0',
    res: 'Comparison Expression testing if identifier "i"is less than or equal to number value of "0"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator >= ',
    exp: 'i >= 0 ',
    res: 'Comparison Expression testing if identifier "i"is greater than or equal to number value of "0"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator == ',
    exp: 'i == 0',
    res: 'Comparison Expression testing if identifier "i"equality number value of "0"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator === ',
    exp: 'i === 0',
    res: 'Comparison Expression testing if identifier "i"strict equality number value of "0"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator != ',
    exp: 'i != 0',
    res: 'Comparison Expression testing if identifier "i"inequality number value of "0"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator -- ',
    exp: 'i--',
    res: 'to decrement identifier "i"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator + ',
    exp: 'i + 1',
    res: 'identifier "i" plus number value of "1"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator - ',
    exp: 'i - 1',
    res: 'identifier "i" minus number value of "1"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator * ',
    exp: 'i * 2',
    res: 'identifier "i" multiply by number value of "2"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator / ',
    exp: 'i / 2',
    res: 'identifier "i" divide by number value of "2"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator % ',
    exp: 'i % 2',
    res: 'identifier "i" remainder of number value of "2"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator ** ',
    exp: 'i ** 2',
    res: 'identifier "i" exponentiation by number value of "2"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator = ',
    exp: 'i = 1',
    res: 'Assignment of identifier "i" to number value of "1"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator -= ',
    exp: 'i -= 1',
    res: 'Subtraction Assignment of identifier "i" minus equals number value of "1"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator *= ',
    exp: 'i *= 2',
    res: 'Multiplication Assignment of identifier "i" multiply equals number value of "2"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator /= ',
    exp: 'i /= 2',
    res: 'Division Assignment of identifier "i" divide equals number value of "2"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator %= ',
    exp: 'i %= 2',
    res: 'Remainder Assignment of identifier "i" remainder equals number value of "2"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator **= ',
    exp: 'i **= 2',
    res: 'Exponentiation Assignment of identifier "i" exponentiation equals number value of "2"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator <<= ',
    exp: 'i <<= 2',
    res: 'Left shift Assignment of identifier "i" to number value of "2"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator >>= ',
    exp: 'i >>= 2',
    res: 'Right shift Assignment of identifier "i" to number value of "2"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator >>>= ',
    exp: 'i >>>= 2',
    res: 'Unsigned right shift Assignment of identifier "i" to number value of "2"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator &= ',
    exp: 'i &= 2',
    res: 'Bitwise AND Assignment of identifier "i" to number value of "2"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator ^= ',
    exp: 'i ^= 2',
    res: 'Bitwise XOR Assignment of identifier "i" to number value of "2"'
  },
  {
    desc: 'Operator analyzer',
    should: 'It should correcly analyze operator |= ',
    exp: 'i |= 2',
    res: 'Bitwise OR Assignment of identifier "i" to number value of "2"'
  },
  {
    desc: 'Literal expression analyzer',
    should: 'It should correcly analyze a literal expression',
    exp: '1',
    res: 'number value of "1"',
  },
  {
    desc: 'Member expression analyzer',
    should: 'It should correctly analyze a member expression',
    exp: 'test.log',
    res: '"log" property of the "test" object. ',
  },
  {
    desc: 'Variable with empty array analyzer',
    should: 'It should correctly analyze a variale assigned to empty array',
    exp: 'let tester = []',
    res: 'Empty array object assigned to the let variable named "tester".',
  },
  {
    desc: 'Anonymous function analyzer',
    should: 'It should correctly analyze an anonymous function',
    exp: 'test(function () {})',
    res: 'Call of the "test" function and passing 1 arguments. Argument 1 is the Declaring "anonymous function" and passing 0 parameters.  The Body consists of the following. Empty Block Statement . ',
  },
  {
    desc: 'Arguments analyzer',
    should: 'It should correctly analyze a call expression with zero arguments',
    exp: 'let tester = test()',
    res: 'Call of the "test" function, passing 0 arguments and assigning the return value to the let variable named "tester". ',
  },
  {
    desc: 'Immediately invoked function expression',
    should: 'It should correctly analyze an immediately invoked function expression',
    exp: '(function counter() {})()',
    res: 'Immediately invoking the following: Declaring "function named counter" and passing 0 parameters.  The Body consists of the following. Empty Block Statement ',
  },
  {
    desc: 'Conditional expression',
    should: 'It should correctly analyze a Conditional Expression ',
    exp: 'isMember ? "$2.00" : "$10.00"',
    res: 'Conditional expression evaluating identifier "isMember". If the condition is true the following is returned, string value of "$2.00". If the condition is false the following is returned, string value of "$10.00".'
  },
  {
    desc: 'This expression',
    should: 'It should correctly analyze a "this" expression',
    exp: 'this.type',
    res: '"type" property of the "this" object. '
  },
  {
    desc: 'This expression II',
    should: 'It should correctly analyze a "this" expression',
    exp: 'this.type(this)',
    res: 'Call of the "type" method on the "This" object and passing 1 arguments. Argument 1 is the "this". '
  },
  {
    desc: 'This expression III',
    should: 'It should correctly analyze a "this" expression',
    exp: 'this()',
    res: 'Call of the "This" function and passing 0 arguments. '
  },
  {
    desc: 'This expression IIII',
    should: 'It should correctly analyze a "this" expression',
    exp: 'this.test.a.b()',
    res: 'Call of the "b" method on the "a" property of the "test" property of the "this" object and passing 0 arguments. '
  },
  {
    desc: 'Template Literals',
    should: 'It should correctly analyze a templpate literal',
    exp: '`${test1} hello ${test2}`',
    res: 'Template Literal with 2 embedded expressions. Expression: identifier "test1"; String text: " hello "; Expression: identifier "test2"; '
  },
  {
    desc: 'Template Literals II',
    should: 'It should correctly analyze a templpate literal',
    exp: '`${test1} hello`',
    res: 'Template Literal with 1 embedded expressions. Expression: identifier "test1"; String text: " hello".'
  },
  {
    desc: 'While Statement',
    should: 'It should correctly analyze a While Statement',
    exp: 'while (n) {n++}',
    res: '"While Statement" declaration that evaluates the following condition; identifier "n". While true, the following is executed; to increment identifier "n". '
  },
  {
    desc: 'While Statement II',
    should: 'It should correctly analyze a While Statement',
    exp: 'const test = (n) => {while (n) {n++}}',
    res: 'Declaring "an anonymous function", passing 1 parameters and assigning the return value to the constant variable named "test". Parameter 1 is the identifier "n".  The Body consists of the following. "While Statement" declaration that evaluates the following condition; identifier "n". While true, the following is executed; to increment identifier "n".  '
  },
  {
    desc: 'New Expression',
    should: 'It should correctly analyze a New Expression',
    exp: 'const test = new Date(test)',
    res: 'Creating new instance of an object with the following constructor function: Date and passing 1 arguments; Argument 1 is the identifier "test". .  The "New" expression is assigned to constant variable named "test". '
  },
  {
    desc: 'New Expression II',
    should: 'It should correctly analyze a New Expression',
    exp: 'new "Date"',
    res: 'Creating new instance of an object with the following constructor function: string value of "Date". '
  },
  {
    desc: 'typeof expression',
    should: 'It should correctly analyze a typeof Expression',
    exp: 'typeof test()',
    res: '"Type of" expression for following:  Call of the "test" function, passing 0 arguments . '
  },
  {
    desc: 'Delete operator',
    should: 'It should correctly analyze a delete expression',
    exp: 'delete test.hello',
    res: 'Delete "hello" property of the "test" object. '
  },
  {
    desc: 'Logical operator expression !',
    should: 'It should correctly analyze a logical not expression ',
    exp: '!test',
    res: 'Logical not operator on following: identifier "test"'
  },
  {
    desc: 'Logical operator expression &&',
    should: 'It should correctly analyze a logical AND expression',
    exp: 'varA && varB',
    res: 'Logical AND Expression on following expressions: Expression 1 is identifier "varA". Expression 2 is identifier "varB". '
  },
  {
    desc: 'Logical operator expression ||',
    should: 'It should correctly analyze a logical OR expression ',
    exp: 'varA || varB',
    res: 'Logical OR Expression on following expressions: Expression 1 is  identifier "varA". Expression 2 is identifier "varB". '
  }
]

for (let i = 0; i < testExpression.length; i++) {
  let test = testExpression[i]
  describe(test.desc, () => {
    it(test.should, () => {
      const tokenizer = esprima.parse(test.exp, {sourceType:'script'})
      const res = pushAnalyzer(tokenizer.body);
      expect(res[0]).to.equal(test.res)
    });
  })
}
