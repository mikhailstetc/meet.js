const t = require('babel-core').types

const functionsToStringsReplace = {
  isRed: 'RED',
  isGreen: 'GREEN',
  isBlue: 'BLUE'
}

module.exports = function() {
  return {
    visitor: {
      Program(path) {
        Object.values(functionsToStringsReplace).forEach((constant) => {
          path.scope.push({
            id: t.identifier(constant),
            init: t.stringLiteral(constant),
            kind: 'const'
          })
        })
      },
      VariableDeclaration(path) {
        const declarations = path.get('declarations')
        declarations.forEach(declaration => {
          if (Object.keys(functionsToStringsReplace).includes(declaration.node.id.name)) {
            declaration.remove()
          }
        })
      },
      MemberExpression(path) {
        const { node } = path
        if (
          t.isIdentifier(node.property, { name: 'toBeTruthy' }) ||
          t.isIdentifier(node.property, { name: 'toBeFalsy' })
        ) {
          if (t.isIdentifier(node.object.callee, { name: 'expect' })) {
            const expectCallPath = path.get('object')
            if (expectCallPath.node.arguments.length === 1) {
              const expectOf = expectCallPath.get('arguments.0')
              const expectOfIdentifier = expectOf.node.callee.name
              const expectOfArgument = expectOf.node.arguments[0].name
              expectOf.replaceWith(t.identifier(expectOfArgument))
              let constToCompare = functionsToStringsReplace[expectOfIdentifier]
              let replacer
              if (node.property.name === 'toBeTruthy') {
                replacer = node.object
              } else {
                replacer = t.memberExpression(node.object, t.identifier('not'))
              }
              path.replaceWith(
                t.memberExpression(replacer, t.identifier('toEqual'))
              )
              path.parentPath.set('arguments', [t.identifier(constToCompare)])
            }
          }
        }
      }
    }
  }
}
