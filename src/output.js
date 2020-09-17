const path = require("path")
const root = process.cwd()
const dist = path.resolve(root, "dist")

const outputIndex = process.argv.findIndex(arg => arg === "-o")
let outputDir = "dist"
if (outputIndex > 0) {
    console.log("构建文件将输出到：", process.argv[outputIndex + 1])
    outputDir = process.argv[outputIndex + 1]
    process.argv.splice(outputIndex, 2)
}
module.exports = {
    outputPath: dist,
    dir: outputDir
}
