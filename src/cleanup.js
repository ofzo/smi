const fs = require("fs")
const path = require("path")
module.exports = function cleanup(p) {
    if (fs.existsSync(p)) {
        if (fs.statSync(p).isDirectory()) {
            fs.readdirSync(p).forEach(item => {
                cleanup(path.resolve(p, item))
            })
            fs.rmdirSync(p)
        }
        else {
            fs.unlinkSync(p)
        }
    } else {
        fs.mkdirSync(p)
    }
}
