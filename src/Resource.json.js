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
        this.content = JSON.stringify(config, null, 4)
    }
}
