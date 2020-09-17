const CombineResource = require("./CombineResource")

module.exports = class Component extends CombineResource {
    /**
     *
     * @param {String} componentPath
     */
    constructor(componentPath, palettes) {
        super(componentPath, palettes)
        this.type = "component"
        this.componentPath = componentPath.replace(process.cwd() + "/", "").replace("@", "").replace("node_modules/", "")
    }
}
