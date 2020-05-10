const path = require("path")
const fs = require("fs")
/**
 * @param {string} ref
 * @param {string} origin
 */
module.exports = function requireResolve(ref, origin = process.cwd()) {
    try {
        switch (ref[0]) {
            case ".":
                return path.resolve(origin, ref)
            case "/":
                return path.resolve(process.cwd(), "./" + ref)
            case "@":
                return path.resolve(process.cwd(), "node_modules", ref.slice(1))
            default:
                const p = path.resolve(origin, ref)
                if (fs.existsSync(p)) {
                    return p
                }
                const module = path.resolve(process.cwd(), "node_modules", ref)
                if (fs.statSync(module).isDirectory()) {
                    const packageJson = require(path.resolve(module, "package.json"))
                    if (packageJson.main || packageJson.main !== "index.js") {
                        fs.writeFileSync(path.resolve(module, "index.js"), `
                        module.exports = require("${packageJson.main}")
                        `)
                    }
                    const file = path.resolve(module, "index.js")
                    if (fs.existsSync(file)) {
                        // 对当前模块进行打包
                        return {
                            requires: [
                                path.resolve(module, "package.json"),
                            ],
                            path: file
                        }
                    } else {
                        console.log("[模块不存在]", ref, " in ", origin)
                    }
                } else {
                    return module
                }
        }
    } catch (error) {
        console.log(error, ref)
    }
}
