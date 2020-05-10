const mkdirP = require("./mkdirP")

const requireResolve = require("./requireResolve")

const fs = require("fs")
const path = require("path")
module.exports = class Resource {
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
    constructor(filePath) {
        this.path = filePath
        if (!fs.existsSync(filePath)) {
            console.log("[文件未找到]", filePath)
            this.notFound = true
            return
        }
        this.outputPath = this.path.replace(process.cwd(), path.resolve(process.cwd(), "dist"))
        const stat = fs.statSync(this.path)
        this.size = stat.size
        this.type = filePath.split(".").pop()
        if (this.type !== "wxml" && this.type !== "js" && this.type !== "scss" && this.type !== "wxss" && this.type !== "json") {
            if (this.size > 8 * 1024) {
                console.log("[文件过大]", this.path.replace(process.cwd(), "") + "(" + Math.ceil(this.size / 1024) + "kb)")
            }
        }
        this.source = fs.readFileSync(this.path)
        this.requires = new Set()
        this.content = this.source
    }
    resolve(file) {
        const result = requireResolve(file, path.resolve(this.path, ".."))
        if (typeof result === "string") {
            return result
        } else {
            result.requires.forEach(item => {
                this.requires.add(item)
            })
            return result.path
        }
    }
    write() {
        if (this.notFound) return false
        this.outputPath = this.outputPath.replace("node_modules", "miniprogram_npm")
        mkdirP(this.outputPath)
        fs.writeFileSync(this.outputPath, this.content)
        return true
    }
}
