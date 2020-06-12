const webpack = require("webpack")
const MemoryFileSystem = require("memory-fs")
const mfs = new MemoryFileSystem()
const path = require("path")
const fs = require("fs")
function webComplier(module, output) {
    return new Promise((resolve, reject) => {
        const webComplier = webpack({
            mode: "development",
            entry: module,
            output: {
                filename: "index.js",
                libraryTarget: "commonjs2",
                path: output
            },
            resolve: {
                extensions: [".js", ".json"],
            },
            devtool: "source-map",
            module: {
                rules: [{
                    test: /\.js$/,
                    loader: fs.existsSync(path.resolve(__dirname, "..", "node_modules", "babel-loader")) ?
                        path.resolve(__dirname, "..", "node_modules", "babel-loader") : "babel-loader"
                }]
            }
        })
        webComplier.outputFileSystem = mfs
        webComplier.run((err, stats) => {
            if (err) {
                console.error(err.stack || err)
                // @ts-ignore
                if (err.details) {
                    // @ts-ignore
                    console.error(err.details)
                }
                reject(err)
                return
            }

            const info = stats.toJson()

            if (stats.hasErrors()) {
                console.error(info.errors)
            }

            if (stats.hasWarnings()) {
                console.warn(info.warnings)
            }
            resolve()
        })
    })
}
function mfsRead(filename) {
    return mfs.readFileSync(filename)
}
module.exports = {
    webComplier, mfsRead
}
