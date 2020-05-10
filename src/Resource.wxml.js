const wxml = require("@vivaxy/wxml")
const babel = require("@babel/core")
const types = require("@babel/types")
const evnReplace = require("./envReplacePlugin")

const Resource = require("./Resource")

module.exports = class WXMLResource extends Resource {
    constructor(filePath) {
        super(filePath)
        this.pages = new Set()
        !this.notFound && this.complier()
    }
    complier() {
        const ast = wxml.parse(this.source)
        const self = this
        try {
            wxml.traverse(ast, (node) => {
                if (node.type === 1) { // element node
                    Object.keys(node.attributes).forEach(attr => {
                        // console.log(attr, node.attributes[attr])
                        if (typeof node.attributes[attr] === "string") {
                            let note = false
                            node.attributes[attr] = node.attributes[attr].replace(/{{(.+?)}}/g, (_, snp) => {
                                note = true
                                const r = babel.transformSync(snp, {
                                    plugins: [evnReplace, {
                                        visitor: {
                                            StringLiteral(path) {
                                                if (attr === "src")
                                                    if (!/^https?:\/\//.test(path.node.value)) {
                                                        self.requires.add(self.resolve(path.node.value))
                                                    }
                                                if (attr === "url")
                                                    if (!/^https?:\/\//.test(path.node.value)) {
                                                        self.pages.add(self.resolve(path.node.value))
                                                    }
                                            },
                                            CallExpression(path) {
                                                // @ts-ignore
                                                if (path.node.callee.name === "page") {
                                                    // @ts-ignore
                                                    self.pages.add(self.resolve(path.node.arguments[0].value))
                                                    // @ts-ignore
                                                    path.replaceWith(types.valueToNode(path.node.arguments[0].value))
                                                    return
                                                }
                                                // @ts-ignore
                                                if (path.node.callee.name === "file") {
                                                    // @ts-ignore
                                                    const file = path.node.arguments[0].value
                                                    // @ts-ignore
                                                    path.replaceWith(types.valueToNode(file))
                                                    self.requires.add(self.resolve(file))
                                                    return
                                                }
                                            }
                                        }
                                    }]
                                })
                                return "{{" + r.code + "}}"
                            }).replace(/"/g, "'").replace(/;}}/g, "}}")

                            if (!note) {
                                if (attr === "src")
                                    if (!/^https?:\/\//.test(node.attributes[attr]))
                                        this.requires.add(this.resolve(node.attributes[attr]))

                                if (attr === "url")
                                    if (!/^https?:\/\//.test(node.attributes[attr]))
                                        this.pages.add(this.resolve(node.attributes[attr]))
                            }
                        }
                    })
                    if (node.tagName === "style") node.childNodes = []
                }
                if (node.type === 3 && node.textContent.replace(/^.$/g, "")) { // text node
                    node.textContent = node.textContent.replace(/{{(.+?)}}/, (_, snp) => {

                        const r = babel.transformSync(snp, { plugins: [evnReplace] })
                        return "{{" + r.code + "}}"

                    }).replace(/"/g, "'").replace(/;}}/g, "}}")
                }
            })

            this.content = wxml.serialize(ast)
        } catch (error) {
            console.log("编译失败", this.path)
            console.log(error)
            process.exit(0)
        }
    }

}
