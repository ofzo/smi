const StyleResource = require("./Resource.style.js")

const JsResource = require("./Resource.js.js")

const JsonResource = require("./Resource.json")

const Resource = require("./Resource")

const WxmlResource = require("./Resource.wxml")
const fs = require("fs")

/**
 * @param {String}  filePath
 */
module.exports = function createResource(filePath, palettes) {
    const type = filePath.split(".").pop()
    switch (type) {
        case "wxml":
            return new WxmlResource(filePath)
        case "json":
            return new JsonResource(filePath)
        case "js":
            return new JsResource(filePath)
        case "wxss":
        case "scss":
            return new StyleResource(filePath, palettes)
        default:
            if (!fs.existsSync(filePath)) {
                const pathJs = filePath + ".js"
                if (!fs.existsSync(pathJs)) {
                    return new Resource(filePath)
                } else {
                    return new JsResource(pathJs)
                }
            } else {
                return new Resource(filePath)
            }
    }
}
