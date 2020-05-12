const mkdirP = require("./mkdirP")
const fs = require("fs")
module.exports = class MResource {
    size
    path
    outputPath
    content
    source
    type
    requires = new Set()
    /**
     *
     * @param {String} filePath
     */
    constructor(filePath, outputPath, content) {
        this.path = filePath
        this.outputPath = outputPath
        this.content = content
    }
    write() {
        mkdirP(this.outputPath)
        fs.writeFile(this.outputPath, this.content, (error) => {
            if (error) {
                console.error("[文件写入错误]", this.outputPath)
                console.error(error)
            }
        })
        return true
    }
}
