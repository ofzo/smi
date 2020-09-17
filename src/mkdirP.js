const path = require("path")
const fs = require("fs")
const root = process.cwd()

module.exports = function mkdirP(filePath) {
    const paths = filePath.replace(root, "").split("/").slice(0, -1)
    let current = root
    paths.forEach(dir => {
        current = path.resolve(current, dir)
        if (!fs.existsSync(current) || !fs.statSync(current).isDirectory()) {
            fs.mkdirSync(current)
        }
    })
}
