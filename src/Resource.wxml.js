const wxml = require("wxml")
const babel = require("@babel/core")
const types = require("@babel/types")
const evnReplace = require("./envReplacePlugin")

const Resource = require("./Resource")
const { NULL } = require("node-sass")

module.exports = class WXMLResource extends Resource {
    constructor(filePath) {
        super(filePath)
        this.pages = new Set()
        !this.notFound && this.complier()
    }
    complier() {
        const ast = wxml.parse(this.source.toString())
        const self = this
        try {
            // @ts-ignore
            wxml.traverse(ast, (node, parent) => {
                if (node.type === 1) { // element node
                    if (typeof node.attributes["wx:if"] !== "undefined") {
                        let rr = NULL
                        const match = node.attributes["wx:if"].match(/^{{(.+?)}}$/)
                        if (match && match[1]) {
                            const code = babel.transformSync(match[1], {
                                plugins: [evnReplace, "minify-constant-folding"]
                            }).code
                            try {
                                console.log(code)
                                // eslint-disable-next-line no-eval
                                rr = eval(code)
                                console.log("rr", rr)
                            } catch (error) {
                                // console.error(error)
                            }
                        } else {
                            rr = !!node.attributes["wx:if"]
                        }
                        if (rr === true) {
                            let remains
                            let index = -1
                            if (parent) {
                                index = parent.childNodes.findIndex(n => n === node)
                                remains = parent.childNodes
                            } else {
                                index = ast.findIndex(n => n === node)
                                remains = ast
                            }
                            delete node.attributes["wx:if"]
                            let deleteCount = 0
                            for (let i = index + 1; i < remains.length; i++) {
                                const next = remains[i]
                                if (!next) break
                                if (next.type !== 1)
                                    if (next.type === 3 && next.textContent === "\n") {
                                        deleteCount++
                                        continue
                                    } else {
                                        break
                                    }
                                if (next.attributes["wx:if"]) break
                                if (!next.attributes["wx:elif"] && !next.attributes["wx:else"]) break
                                deleteCount++
                                // remove wx:elif and wx:else
                            }
                            remains.splice(index + 1, deleteCount)
                        } else if (rr === false) {
                            let remains
                            let index = -1
                            if (parent) {
                                index = parent.childNodes.findIndex(n => n === node)
                                parent.childNodes.splice(index, 1)
                                remains = parent.childNodes
                            } else {
                                index = ast.findIndex(n => n === node)
                                ast.splice(index, 1)
                                remains = ast
                            }
                            if (remains[index + 1] && remains[index + 1].type === 1) {
                                if (remains[index + 1].attributes["wx:elif"]) {
                                    remains[index + 1].attributes["wx:if"] = remains[index + 1].attributes["wx:elif"]
                                    delete remains[index + 1].attributes["wx:elif"]
                                }
                                if (remains[index + 1].attributes["wx:else"]) {
                                    delete remains[index + 1].attributes["wx:else"]
                                }
                            }
                            return
                        } else {

                        }
                    }
                    if (typeof node.attributes["wx:elif"] !== "undefined") {
                        let rr = NULL
                        const match = node.attributes["wx:elif"].match(/^{{(.+?)}}$/)
                        if (match && match[1]) {
                            const code = babel.transformSync(match[1], {
                                plugins: [evnReplace, "minify-constant-folding"]
                            }).code
                            try {
                                console.log(code)
                                // eslint-disable-next-line no-eval
                                rr = eval(code)
                                console.log("rr", rr)
                            } catch (error) {
                                // console.error(error)
                            }
                        } else {
                            rr = !!node.attributes["wx:elif"]
                        }
                        if (rr === true) {
                            let remains
                            let index = -1
                            if (parent) {
                                index = parent.childNodes.findIndex(n => n === node)
                                remains = parent.childNodes
                            } else {
                                index = ast.findIndex(n => n === node)
                                remains = ast
                            }
                            node.attributes["wx:else"] = true
                            delete node.attributes["wx:elif"]
                            let deleteCount = 0
                            for (let i = index + 1; i < remains.length; i++) {
                                const next = remains[i]
                                if (!next) break
                                if (next.type !== 1)
                                    if (next.type === 3 && next.textContent === "\n") {
                                        deleteCount++
                                        continue
                                    } else {
                                        break
                                    }
                                if (next.attributes["wx:if"]) break
                                if (!next.attributes["wx:elif"] && !next.attributes["wx:else"]) break
                                deleteCount++
                                // remove wx:elif and wx:else
                            }
                            remains.splice(index + 1, deleteCount)
                        } else if (rr === false) {
                            let index = -1
                            if (parent) {
                                index = parent.childNodes.findIndex(n => n === node)
                                parent.childNodes.splice(index, 1)
                            } else {
                                index = ast.findIndex(n => n === node)
                                ast.splice(index, 1)
                            }
                            return
                        }
                    }

                    Object.keys(node.attributes).forEach(attr => {
                        // console.log(attr, node.attributes[attr])
                        if (typeof node.attributes[attr] === "string") {
                            let note = false
                            node.attributes[attr] = node.attributes[attr].replace(/{{(.+?)}}/g, (_, snp) => {
                                try {
                                    note = true
                                    const r = babel.transformSync(snp, {
                                        plugins: [evnReplace, {
                                            visitor: {
                                                StringLiteral(path) {
                                                    if (attr === "src")
                                                        if (!/^https?:\/\//.test(path.node.value)) {
                                                            if (path.node.value) {
                                                                const index = path.node.value.indexOf("?")
                                                                let value = path.node.value
                                                                if (index > 0) {
                                                                    value = value.slice(0, index)
                                                                }
                                                                self.resolve(value, self.requires)
                                                            } else {
                                                                console.log("[引用错误]".red, self.path.replace(process.cwd(), "."), "src=\"" + path.node.value + "\"")
                                                            }
                                                        }
                                                    if (attr === "url")
                                                        if (!/^https?:\/\//.test(path.node.value)) {
                                                            if (path.node.value) {
                                                                const index = path.node.value.indexOf("?")
                                                                let value = path.node.value
                                                                if (index > 0) {
                                                                    value = value.slice(0, index)
                                                                }
                                                                self.resolve(value, self.pages)
                                                            } else {
                                                                console.log("[引用错误]".red, self.path.replace(process.cwd(), "."), "url=\"" + path.node.value + "\"")
                                                            }
                                                        }
                                                },
                                                CallExpression(path) {
                                                    // @ts-ignore
                                                    if (path.node.callee.name === "page") {
                                                        // @ts-ignore
                                                        self.resolve(path.node.arguments[0].value, self.pages)
                                                        // @ts-ignore
                                                        path.replaceWith(types.valueToNode(path.node.arguments[0].value.replace(/^@/, "/")))
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
                                        }]
                                    })
                                    return "{{" + r.code + "}}"
                                } catch (error) {
                                    console.error("[语法警告]", ("<" + node.tagName + " ... " + attr + "=\"" + node.attributes[attr] + (node.selfClosing ? "\"/>" : "\"><" + node.tagName + ">")).blue, this.path.replace(process.cwd(), "."))
                                    return "{{" + snp + "}}"
                                }
                            }).replace(/"/g, "'").replace(/;}}/g, "}}")

                            if (!note) {
                                if (attr === "src")
                                    if (!/^https?:\/\//.test(node.attributes[attr])) {
                                        if (node.attributes[attr]) {
                                            const index = node.attributes[attr].indexOf("?")
                                            let value = node.attributes[attr]
                                            if (index > 0) {
                                                value = value.slice(0, index)
                                            }
                                            this.resolve(value, this.requires)
                                            node.attributes[attr] = node.attributes[attr].replace(/^@/, "/")
                                        } else {
                                            console.log("[引用错误] ".red, self.path, "src=\"" + node.attributes[attr] + "\"")
                                        }
                                    }

                                if (attr === "url")
                                    if (!/^https?:\/\//.test(node.attributes[attr])) {
                                        if (node.attributes[attr]) {
                                            const index = node.attributes[attr].indexOf("?")
                                            let value = node.attributes[attr]
                                            if (index > 0) {
                                                value = value.slice(0, index)
                                            }
                                            this.resolve(value, this.pages)
                                            node.attributes[attr] = node.attributes[attr].replace(/^@/, "/")
                                        } else {
                                            console.log("[引用错误] ".red, self.path, "url=\"" + node.attributes[attr] + "\"")
                                        }
                                    }
                            }
                        }
                        if (attr === "class" && process.env.APP_NAME)
                            node.attributes[attr] = process.env.APP_NAME + " " + node.attributes[attr]
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

            // @ts-ignore
            this.content = wxml.serialize(ast)
        } catch (error) {
            console.log("编译失败".red, this.path)
            console.log(error)
            process.exit(0)
        }
    }

}
