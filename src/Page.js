const CombineResource = require("./CombineResource")

module.exports = class Page extends CombineResource {
    /**
     *
     * @param {String} pagePath
     */
    constructor(pagePath, palettes) {
        super(pagePath, palettes)
        this.type = "page"
        this.pagePath = pagePath.replace(process.cwd() + "/", "").replace("@", "").replace("node_modules/", "")
    }
}
