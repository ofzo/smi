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
    notFound = false

    requires = new Set()
    /**
     *
     * @param {String} filePath
     */
    constructor(filePath) {
        this.path = filePath
        if (!fs.existsSync(filePath)) {
            console.log("[文件缺失]".red, filePath)
            this.notFound = true
            return
        }
        this.outputPath = this.path.replace(process.cwd(), path.resolve(process.cwd(), "dist"))
        const stat = fs.statSync(this.path)
        this.size = stat.size
        this.type = filePath.split(".").pop()
        if (this.type !== "wxml" && this.type !== "js" && this.type !== "scss" && this.type !== "wxss" && this.type !== "json") {
            if (this.size > 8 * 1024) {
                console.log("[文件过大]".yellow,
                    ("(" + Math.ceil(this.size / 1024) + "kb)").yellow + this.path.replace(process.cwd(), "."))
            }
        }
        this.source = fs.readFileSync(this.path)
        this.requires = new Set()
        this.content = this.source
        this.modules = new Set()
    }
    /**
     *
     * @param {String} file
     * @param {Set<String>} set
     */
    resolve(file, set) {
        const result = requireResolve(file, path.resolve(this.path, ".."))
        if (typeof result === "string") {
            set.add(result)
            return result
        } else {
            if (result.files) {
                result.files.forEach(file => {
                    this.modules.add(file)
                })
            }
            return result.files[0].name
        }
    }
    write() {
        if (this.notFound) return false
        this.outputPath = this.outputPath.replace("node_modules/", "")
        mkdirP(this.outputPath)
        fs.writeFile(this.outputPath, this.content, (error) => {
            if (error) {
                console.error("[文件写入错误]".red, this.outputPath)
                console.error(error)
            }
        })
        return true
    }
}
