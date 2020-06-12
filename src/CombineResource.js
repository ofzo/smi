const JsResource = require("./Resource.js.js")

const JsonResource = require("./Resource.json")

const WXMLResource = require("./Resource.wxml")
const StyleResource = require("./Resource.style")

const fs = require("fs")

module.exports = class CombineResource {
    type = "page"

    /**
     *
     * @param {String} filePath
     */
    constructor(filePath, palettes) {
        this.path = filePath
        this.palettes = palettes
        this.wxml = new WXMLResource(filePath + ".wxml")
        this.json = new JsonResource(filePath + ".json")
        if (/\.js$/.test(filePath)) {
            this.js = new JsResource(filePath)
        } else {
            this.js = new JsResource(filePath + ".js")
        }
        if (fs.existsSync(filePath + ".wxss"))
            this.style = new StyleResource(filePath + ".wxss", palettes)
        else
            this.style = new StyleResource(filePath + ".scss", palettes)
        this.updatePath()
    }
    updatePath() {
        this.wxml.outputPath = this.wxml.outputPath?.replace("node_modules/", "")
        this.js.outputPath = this.js.outputPath?.replace("node_modules/", "")
        this.json.outputPath = this.json.outputPath?.replace("node_modules/", "")
        this.style.outputPath = this.style.outputPath?.replace("node_modules/", "")
    }
}
