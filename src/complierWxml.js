const wxml = require("@vivaxy/wxml")
const babel = require("@babel/core")
const types = require("@babel/types")
const fs = require("fs")
const path = require("path")
const resolvePath = require("./resolvePath")
const evnReplace = require("./envReplacePlugin")


// const ast = wxml.parse(`<navigator class="bottom" url="/pages/user-login/user-login" bind:tap="raceLogin">
//         <primary-button>立即体验</primary-button>
//     </navigator>`)
// const imports = new Set()
// console.log(ast)
// wxml.traverse(ast, function (node) {
//     if (node.type === 1) { // element node

//         Object.keys(node.attributes).forEach(attr => {
//             if (typeof node.attributes[attr] === "string") {
//                 let note = false
//                 node.attributes[attr] = node.attributes[attr].replace(/{{(.+?)}}/g, (_, snp) => {
//                     note = true
//                     const r = babel.transformSync(snp, {
//                         plugins: [evnReplace, {
//                             visitor: {
//                                 StringLiteral(path) {
//                                     if (["url", "src"].includes(attr)) {
//                                         if (!/^https?:\/\//.test(path.node.value))
//                                             imports.add(path.node.value)
//                                     }
//                                 },
//                                 CallExpression(path) {
//                                     if (path.node.callee.name === "page") {
//                                         imports.add(path.node.arguments[0].value)
//                                         path.replaceWith(
//                                             types.valueToNode(
//                                                 path.node.arguments[0].value
//                                             )
//                                         )
//                                         return
//                                     }
//                                     // console.log(path.get("callee").get("object"))
//                                     if (path.get("object").matchesPattern("App.$router")) {
//                                         // console.log(path.node.object.property)
//                                     }
//                                 }
//                             }
//                         }]
//                     })
//                     return "{{" + r.code + "}}"
//                 }).replace(/"/g, "'").replace(/;}}/g, "}}")
//                 if (["url", "src"].includes(attr)) {
//                     if (!note && !/^https?:\/\//.test(node.attributes[attr]))
//                         imports.add(node.attributes[attr])
//                 }
//             }
//         })
//     }
//     if (node.type === 3 && node.textContent.replace(/^.$/g, "")) { // text node
//         node.textContent = node.textContent.replace(/{{(.+)}}/, (_, snp) => {

//             const r = babel.transformSync(snp, { plugins: [evnReplace] })
//             return "{{" + r.code + "}}"

//         }).replace(/"/g, "'").replace(/;}}$/g, "}}")
//     }
// })

// console.log(imports, Array.from(imports))
// console.log(wxml.serialize(ast))

/**
 * @param {string} filePath
 */
module.exports = function complierWxml(filePath) {
    // console.log(filePath)
    const source = fs.readFileSync(filePath).toString()
    const ast = wxml.parse(source)
    const imports = new Set()
    const pages = new Set()
    try {
        wxml.traverse(ast, function visitor(node) {
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
                                                    imports.add(path.node.value)
                                                }
                                            if (attr === "url")
                                                if (!/^https?:\/\//.test(path.node.value)) {
                                                    pages.add(path.node.value)
                                                }
                                        },
                                        CallExpression(path) {
                                            if (path.node.callee.name === "page") {
                                                pages.add(path.node.arguments[0].value)
                                                path.replaceWith(
                                                    types.valueToNode(
                                                        path.node.arguments[0].value
                                                    )
                                                )
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
                                }]
                            })
                            return "{{" + r.code + "}}"
                        }).replace(/"/g, "'").replace(/;}}/g, "}}")

                        if (!note) {
                            if (attr === "src")
                                if (!/^https?:\/\//.test(node.attributes[attr]))
                                    imports.add(node.attributes[attr])

                            if (attr === "url")
                                if (!/^https?:\/\//.test(node.attributes[attr]))
                                    pages.add(node.attributes[attr])
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

        return {
            path: filePath,
            source,
            output: wxml.serialize(ast),
            dependencies: [...imports].map(ipt => resolvePath(ipt, path.resolve(filePath, ".."))),
            pages: [...pages].map(p => resolvePath(p, path.resolve(filePath, "..")))
        }
    } catch (error) {
        console.log("编译失败", filePath)
        console.log(error)
        process.exit(0)
    }
}
