const sass = require("node-sass")
const Resource = require("./Resource")
const fs = require("fs")

module.exports = class StyleResource extends Resource {
    constructor(filePath, palettes) {
        if (!fs.existsSync(filePath))
            filePath = filePath.replace(/\.wxss$/, "scss")
        super(filePath)
        this.palettes = palettes
        if (this.notFound) return

        this.outputPath = this.outputPath.replace(new RegExp(`\\.${this.type}$`), ".wxss")
        this.complier(palettes)
    }
    complier(palettes) {

        const palette = palettes[this.type]
        if (this.type === "scss") {
            let data = this.source
            if (palette) {
                data = palette + "\n" + this.source
            }
            const outFile = this.path.replace(new RegExp(`\\.${this.type}$`), "wxss")
            try {
                this.content = sass.renderSync({
                    data,
                    outFile,
                    importer: (importer) => {
                        const file = this.resolve(importer)
                        this.requires.add(this.resolve(file))
                        return { file }
                    }
                }).css
            } catch (error) {
                console.log("[编译文件失败]:", this.path)
                console.log(error)
            }
        } else
            this.content = this.source
    }
}
