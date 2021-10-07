const recast = require('recast')
const { visit, builders, namedTypes } = require('ast-types')
const fs = require('fs')

const functionsToStringsReplace = {
  isRed: 'RED',
  isGreen: 'GREEN',
  isBlue: 'BLUE'
}

const oldFileContent = fs.readFileSync('./example/oldCode.test.js')

const ast = recast.parse(oldFileContent)

visit(ast, {
  visitProgram(path) {
    const constants = Object.values(functionsToStringsReplace).map(constant =>
      builders.variableDeclaration('const', [
        builders.variableDeclarator(
          builders.identifier(constant),
          builders.stringLiteral(constant)
        )
      ])
    )
    path.get('body').unshift(...constants)
    this.traverse(path)
  },
  visitDeclaration(path) {
    const declarations = path.get('declarations')
    declarations.value.forEach((declarationValue, index) => {
      if (
        Object.keys(functionsToStringsReplace).includes(
          declarationValue.id.name
        )
      ) {
        path.get('declarations', index).prune()
      }
    })
    this.traverse(path)
  },
  visitMemberExpression(path) {
    const { node } = path
    if (
      namedTypes.Identifier.check(node.property, { name: 'toBeTruthy' }) ||
      namedTypes.Identifier.check(node.property, { name: 'toBeFalsy' })
    ) {
      if (namedTypes.Identifier.check(node.object.callee, { name: 'expect' })) {
        const expectCallPath = path.get('object')
        if (expectCallPath.node.arguments.length === 1) {
          const expectOf = expectCallPath.get('arguments', 0)
          const expectOfIdentifier = expectOf.node.callee.name
          const expectOfArgument = expectOf.node.arguments[0].name
          expectOf.replace(builders.identifier(expectOfArgument))
          let constToCompare = functionsToStringsReplace[expectOfIdentifier]
          let replacer
          if (node.property.name === 'toBeTruthy') {
            replacer = node.object
          } else {
            replacer = builders.memberExpression(
              node.object,
              builders.identifier('not')
            )
          }
          path.replace(
            builders.memberExpression(replacer, builders.identifier('toEqual'))
          )
          path.parentPath.node.arguments = [builders.identifier(constToCompare)]
        }
      }
      return false
    }
  }
})

fs.writeFileSync(
  './example/refactoredCode.test.js',
  recast.print(ast, {quote: "single"}).code
)
