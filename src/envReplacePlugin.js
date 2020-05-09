
// const { envs } = require("./envs")
const colors = require("colors")
const types = require("@babel/types")

module.exports = {
    visitor: {
        MemberExpression(path) {
            if (path.get("object").matchesPattern("process.env")) {
                const key = path.toComputedKey()
                if (
                    types.isStringLiteral(key) && process.env[key.value]
                ) {
                    try {
                        path.replaceWith(
                            types.valueToNode(
                                JSON.parse(process.env[key.value])
                            )
                        )
                    } catch {
                        path.replaceWith(
                            types.valueToNode(
                                process.env[key.value]
                            )
                        )
                    }
                } else {
                    console.log(
                        colors.bgRed(colors.white(" ERROR: ")),
                        colors.red(
                            "expect a env " +
                            colors.underline(`\`process.env.${key.value}\``) +
                            " , but it is " +
                            colors.underline(`\`${void 0}\``)
                        )
                    )
                }
            }
        }
    }
}
