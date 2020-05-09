const path = require("path")
/**
 * @param {string} ref
 * @param {string} origin
 */
module.exports = function resolvePath(ref, origin = process.cwd()) {

    try {
        if (ref.startsWith("/")) {
            return path.resolve(process.cwd(), "./" + ref)
        } else if (ref.startsWith("@")) {
            return path.resolve(process.cwd(), "node_modules", ref.slice(1))
        } else {
            return path.resolve(origin, ref)
        }
    } catch (error) {
        console.log(error, ref)
    }
}
