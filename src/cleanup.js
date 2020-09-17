const fs = require("fs")
const path = require("path")

const clean = (p) => {
    if (fs.statSync(p).isDirectory()) {
        fs.readdirSync(p).forEach(item => {
            clean(path.resolve(p, item))
        })
        fs.rmdirSync(p)
    } else fs.unlinkSync(p)
}

module.exports = function cleanup(p) {
    if (fs.existsSync(p)) {
        if (fs.statSync(p).isDirectory()) {
            fs.readdirSync(p).forEach(item => {
                clean(path.resolve(p, item))
            })
        }
        else {
            fs.unlinkSync(p)
        }
    } else {
        fs.mkdirSync(p)
    }
}
