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
                if (!fs.existsSync(path.resolve(process.cwd(), "node_modules", ref))) {
                    return path.resolve(process.cwd(), "node_modules", ref.slice(1))
                }
            default:
                const p = path.resolve(origin, ref)
                if (fs.existsSync(p)) {
                    return p
                }
                // const refs = ref.split("/")

                let packageRoot = origin
                let module = ""
                // console.log("[查找模块]", ref)
                while (packageRoot !== "/") {
                    if (
                        fs.existsSync(path.resolve(packageRoot, "package.json"))
                    ) {
                        module = path.resolve(packageRoot, "node_modules", ref)
                        // console.log("          ", module)
                        if (fs.existsSync(module)) {
                            break
                        }
                    }
                    packageRoot = path.resolve(packageRoot, "..")
                }
                if (packageRoot === "/") {
                    console.log("[模块缺失]".red, ref, origin)
                    process.exit(1)
                }
                const packageJson = require(path.resolve(module, "package.json"))
                // console.log("[找到模块]", module + "@" + packageJson.version)
                if (fs.statSync(module).isDirectory()) {
                    const file = path.resolve(module, packageJson.main)
                    if (fs.existsSync(file)) {
                        // 对当前模块进行打包
                        return {
                            files: [{
                                path: file,
                                name: ref
                            }]
                        }
                    } else {
                        console.error("[模块缺失]".red, file)
                    }
                } else if (fs.statSync(module).isFile()) {
                    return module
                } else {
                    console.log("[文件错误]".red, ref)
                }

        }
    } catch (error) {
        console.log(error, ref)
    }
}
