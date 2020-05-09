const fs = require("fs")
const path = require("path")
const resolvePath = require("./resolvePath")
const sass = require("node-sass")

module.exports = function complierStyle(filePath, palettes) {
    const ext = filePath.split(".").pop()
    const palette = palettes[ext]
    const source = fs.readFileSync(filePath).toString()
    if (ext === "scss") {
        let data = source
        if (palette) {
            data = palette + "\n" + source
        }
        const outFile = filePath.replace(ext, "wxss")
        const dependencies = new Set()
        const output = sass.renderSync({
            data,
            outFile,
            importer: (importer) => {
                const file = resolvePath(importer, path.resolve(filePath, ".."))
                dependencies.add(file)
                return {
                    file
                }
            }
        }).css
        try {
            return {
                path: filePath,
                source,
                output: output,
                dependencies
            }
        } catch (error) {
            console.log("[编译文件失败]:", filePath, error)
        }
    } else
        return {
            path: filePath,
            source,
            output: source,
            dependencies: new Set()
        }
}
