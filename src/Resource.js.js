const babel = require("@babel/core")
const types = require("@babel/types")
const evnReplace = require("./envReplacePlugin")
const Resource = require("./Resource")

module.exports = class JsResource extends Resource {
    constructor(filePath) {
        super(filePath)
        this.pages = new Set()
        this.modules = new Set()
        !this.notFound && this.complier()
    }
    complier() {
        try {
            const self = this
            this.content = babel.transformSync(this.source.toString(), {
                plugins: [evnReplace,
                    {
                        visitor: {
                            ImportDeclaration(path) {
                                const value = path.node.source.value
                                self.resolve(value, self.requires)
                            },
                            CallExpression(path) {
                                // @ts-ignore
                                if (path.node.callee.name === "require") {
                                    // @ts-ignore
                                    const module = path.node.arguments[0].value
                                    // @ts-ignore
                                    self.resolve(module, self.requires)
                                    return
                                }
                                // @ts-ignore
                                if (path.node.callee.name === "page") {
                                    // @ts-ignore
                                    const page = path.node.arguments[0] && path.node.arguments[0].value
                                    if (typeof page === "string") {
                                        // @ts-ignore
                                        path.replaceWith(types.valueToNode(page.replace(/^@/, "/")))
                                        self.resolve(page, self.pages)
                                    } else {
                                        console.error("[无效引用] ".red, self.path.replace(process.cwd(), ".") + ":" + path.node.loc.start.line, path.toString())
                                        path.replaceWith(path.node.arguments[0])
                                    }
                                    return
                                }
                                // @ts-ignore
                                if (path.node.callee.name === "file") {
                                    // @ts-ignore
                                    const file = path.node.arguments[0].value
                                    if (typeof file === "string") {
                                        // @ts-ignore
                                        path.replaceWith(types.valueToNode(file.replace(/^@/, "/")))
                                        self.resolve(file, self.requires)
                                    } else {
                                        console.error("[无效引用] ".red, self.path.replace(process.cwd(), ".") + ":" + path.node.loc.start.line, path.toString())
                                        path.replaceWith(path.node.arguments[0])
                                    }
                                    return
                                }
                            }
                        }
                    }, {
                        visitor: {
                            // IfStatement: {
                            //     exit(path) {
                            //         const test = path.node.test
                            //         if (types.isBinaryExpression(test)) {
                            //             const left = path.node.test.left.value
                            //             if (typeof left === "undefined") return
                            //             const right = path.node.test.right.value
                            //             if (typeof right === "undefined") return
                            //             const operator = path.node.test.operator
                            //             if (operator === "==")
                            //                 // eslint-disable-next-line eqeqeq
                            //                 if (left != right) path.remove()
                            //                 else path.replaceWithMultiple(path.node.consequent.body)
                            //             else if (operator === "===")
                            //                 if (left !== right) path.remove()
                            //                 else path.replaceWithMultiple(path.node.consequent.body)
                            //         } else if (
                            //             types.isStringLiteral(test) ||
                            //             types.isNumericLiteral(test) ||
                            //             types.isNullLiteral(test) ||
                            //             types.isBigIntLiteral(test) ||
                            //             types.isBooleanLiteral(test)
                            //         ) {
                            //             if (!!test.value) {
                            //                 path.replaceWithMultiple(path.node.consequent.body)
                            //             } else {
                            //                 path.remove()
                            //             }
                            //         }
                            //     }
                            // }
                        }
                    }
                ]
            }).code
        } catch (error) {
            console.log("[编译失败]".red, this.path)
            console.log(error)
            process.exit(0)
        }
    }
}
