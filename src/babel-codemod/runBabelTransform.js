const babel = require('babel-core')
const prettier = require('prettier')
const fs = require('fs')

const oldFileContent = fs.readFileSync('./example/oldCode.test.js')

const result = babel.transform(oldFileContent, {
  plugins: [['./src/babel-codemod/index.js']]
}).code

fs.writeFileSync(
  './example/refactoredCode.test.js',
  prettier.format(result, { semi: false, singleQuote: true, parser: 'babel' })
)
