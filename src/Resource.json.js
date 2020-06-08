const Resource = require("./Resource")

module.exports = class JsonResource extends Resource {

    constructor(filePath, config) {
        super(filePath)
        this.components = new Set()
        this.config = config
        !this.notFound && this.complier()
    }

    complier() {
        this.components = new Set()
        const config = this.config || require(this.path);
        (config.usingComponents ? Object.entries(config.usingComponents) : []).forEach(([key, ipt]) => {
            config.usingComponents[key] = ipt.replace("@", "/")
            this.resolve(ipt, this.components)
        })
        Object.entries(config).forEach(([key, value]) => {
            if (typeof value === "string")
                config[key] = value.replace(/^\$\{(process\.env\.[A-Z_]+)\}$/, (_, snp) => JSON.parse(process.env[snp]))
        })
        this.content = JSON.stringify(config, null, 4)
    }
}
