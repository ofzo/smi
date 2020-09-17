const Resource = require("./Resource")
const fs = require("fs")
const path = require("path")
const { dir } = require("./output")
module.exports = class JsonResource extends Resource {

    constructor(filePath, config) {
        if (fs.existsSync(filePath + ".js")) {
            super(filePath + ".js")
            this.outputPath = filePath.replace(process.cwd(), path.resolve(process.cwd(), dir))
        } else {
            super(filePath)
        }
        this.components = new Set()
        this.config = config
        !this.notFound && this.complier()
    }

    complier() {
        this.components = new Set()
        const config = this.config || require(this.path);
        (config.usingComponents ? Object.entries(config.usingComponents) : []).forEach(([key, ipt]) => {
            ipt = ipt.replace(/\$\{process\.env\.([A-Za-z0-9_]+)\}/, (_, snp) => {
                return process.env[snp] || (console.log("[环境缺失]".red, snp), "")
            })
            config.usingComponents[key] = ipt.replace("@", "/")
            this.resolve(ipt, this.components)
        })
        Object.entries(config).forEach(([key, value]) => {
            if (typeof value === "string")
                config[key] = value.replace(/^\$\{process\.env\.([A-Z_]+)\}$/, (_, snp) => {
                    return process.env[snp] || (console.log("[环境缺失]".red, snp), "")
                })
        })
        this.content = JSON.stringify(config, null, 4)
    }
}
