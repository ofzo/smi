const fs = require("fs")
const path = require("path")
const babel = require("@babel/core")
const types = require("@babel/types")
const evnReplace = require("./envReplacePlugin")
const resolvePath = require("./resolvePath")

module.exports = function complierJs(filePath) {
    try {
        const source = fs.readFileSync(filePath)
        const imports = new Set()
        const pages = new Map()
        const r = babel.transformSync(source, {
            plugins: [
                evnReplace,
                {
                    visitor: {
                        ImportDeclaration(path) {
                            const value = path.node.source.value
                            console.log(value)
                            imports.add(value)
                        },
                        CallExpression(path) {
                            if (path.node.callee.name === "require") {
                                const module = path.node.arguments[0].value
                                imports.add(module)
                            }
                            if (path.node.callee.name === "page") {
                                const page = path.node.arguments[0].value
                                path.replaceWith(
                                    types.valueToNode(page)
                                )
                                pages.add(page)
                            }
                            if (path.node.callee.name === "file") {
                                const file = path.node.arguments[0].value
                                path.replaceWith(
                                    types.valueToNode(file)
                                )
                                imports.add(file)
                            }
                        }
                    }
                },
            ]
        })
        return {
            path: filePath,
            source,
            output: r.code,
            dependencies: [...imports].map(ipt => resolvePath(ipt.replace("@", "/node_modules/"), path.resolve(filePath, ".."))),
            pages: [...pages].map(p => resolvePath(p, path.resolve(filePath, "..")))
        }
    } catch (error) {
        console.log("编译失败", filePath)
        console.log(error)
        process.exit(0)
    }
}
