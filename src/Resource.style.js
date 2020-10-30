const sass = require("node-sass")
const Resource = require("./Resource")
const fs = require("fs")
const cssTree = require("css-tree")

module.exports = class StyleResource extends Resource {
    constructor(filePath, palettes) {
        if (!fs.existsSync(filePath))
            filePath = filePath.replace(/\.wxss$/, ".scss")
        super(filePath)
        this.palettes = palettes
        if (this.notFound) return

        this.outputPath = this.outputPath.replace(new RegExp(`\\.${this.type}$`), ".wxss")
        this.complier(palettes)
    }
    complier(palettes) {

        const palette = palettes[this.type]
        if (this.type === "scss") {
            let data = this.source.toString()
            if (palette) {
                data = palette + "\n" + data
            }
            const outFile = this.path.replace(new RegExp(`\\.${this.type}$`), "wxss")
            try {
                this.content = sass.renderSync({
                    data,
                    outFile,
                    importer: (importer) => {
                        const file = this.resolve(importer, this.requires)
                        return { file }
                    }
                }).css
            } catch (error) {
                console.log("[编译文件失败]:".red, this.path)
                console.log(error)
            }
        } else if (this.type === "wxss") {
            const content = this.source.toString()
            const imports = new Set(content.matchAll(/@import "(.+)";/g))
            imports.forEach(([_, snp]) => {
                this.resolve(snp, this.requires)
            })
        } else
            this.content = this.source
        const ast = cssTree.parse(this.content)
        cssTree.walk(ast, function (node, item, path) {
            if (node.type === "Rule") {
                if (node.prelude.type === "SelectorList") {
                    node.prelude.children.forEach(child => {
                        if (child.type === "Selector") {
                            if (child.children.some(c => c.type === "ClassSelector" && c.name !== process.env.APP_NAME)) {
                                // path.remove()
                            }
                        }
                    })
                }
            }
        })
        this.content = cssTree.generate(ast)
    }
}
