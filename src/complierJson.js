
const fs = require("fs")
const resolvePath = require("./resolvePath")
const path = require("path")
module.exports = function complierJson(filePath) {
    const json = require(filePath)
    const dependencies = (json.usingComponents ? Object.entries(json.usingComponents) : []).map(([key, ipt]) => {
        json.usingComponents[key] = ipt.replace("@", "/node_modules/")
        return resolvePath(ipt, path.resolve(filePath, ".."))
    })
    return {
        path: filePath,
        source: fs.readFileSync(filePath).toString(),
        output: json,
        dependencies,
    }
}
