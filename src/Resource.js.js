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
                plugins: [evnReplace, {
                    visitor: {
                        ImportDeclaration(path) {
                            const value = path.node.source.value
                            path.node.source.value = value.replace(/^@/, "/")

                            self.resolve(value, self.requires)
                        },
                        CallExpression(path) {
                            // @ts-ignore
                            if (path.node.callee.name === "require") {
                                // @ts-ignore
                                const module = path.node.arguments[0].value
                                // @ts-ignore
                                path.node.arguments[0].value = module.replace(/^@/, "/")
                                // @ts-ignore
                                self.resolve(module, self.requires)
                                return
                            }
                            // @ts-ignore
                            if (path.node.callee.name === "page") {
                                // @ts-ignore
                                const page = path.node.arguments[0].value
                                // @ts-ignore
                                path.replaceWith(types.valueToNode(page.replace(/^@/, "/")))
                                self.resolve(page, self.pages)
                                return
                            }
                            // @ts-ignore
                            if (path.node.callee.name === "file") {
                                // @ts-ignore
                                const file = path.node.arguments[0].value
                                // @ts-ignore
                                path.replaceWith(types.valueToNode(file.replace(/^@/, "/")))
                                self.resolve(file, self.requires)
                                return
                            }
                        }
                    }
                },
                ]
            }).code
        } catch (error) {
            console.log("[编译失败]", this.path)
            console.log(error)
            process.exit(0)
        }
    }
}
