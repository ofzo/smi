const babel = require("@babel/core")
const types = require("@babel/types")
const evnReplace = require("./envReplacePlugin")
const Resource = require("./Resource")

module.exports = class JsResource extends Resource {
    constructor(filePath) {
        super(filePath)
        this.pages = new Set()
        !this.notFound && this.complier()
    }
    complier() {
        try {
            const self = this
            this.content = babel.transformSync(this.source.toString(), {
                plugins: [evnReplace, {
                    visitor: {
                        ImportDeclaration(path) {
                            const value = path.node.source.value
                            self.requires.add(self.resolve(value))
                        },
                        CallExpression(path) {
                            // @ts-ignore
                            if (path.node.callee.name === "require") {
                                // @ts-ignore
                                const module = path.node.arguments[0].value
                                // @ts-ignore
                                self.requires.add(self.resolve(module))
                                return
                            }
                            // @ts-ignore
                            if (path.node.callee.name === "page") {
                                // @ts-ignore
                                const page = path.node.arguments[0].value
                                // @ts-ignore
                                path.replaceWith(types.valueToNode(page.replace(/^@/, "/")))
                                self.pages.add(self.resolve(page))
                                return
                            }
                            // @ts-ignore
                            if (path.node.callee.name === "file") {
                                // @ts-ignore
                                const file = path.node.arguments[0].value
                                // @ts-ignore
                                path.replaceWith(types.valueToNode(file.replace(/^@/, "/")))
                                self.requires.add(self.resolve(file))
                                return
                            }
                        }
                    }
                },
                ]
            }).code
        } catch (error) {
            console.log("编译失败", this.path)
            console.log(error)
            process.exit(0)
        }
    }
}
