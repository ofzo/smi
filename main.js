#!/usr/bin/env node
require("colors")
console.log("current smi version", require("./package.json").version.green)

const path = require("path")
const fs = require("fs")
const root = process.cwd()
const webpack = require("webpack")

class SMI {
    constructor(options) { }
    apply(complier) {
        complier.hooks.emit.tapAsync("smi", (compilation, callback) => {
            compilation.chunks.forEach((chunk) => {
                debugger
                chunk.getModules().forEach(mod => {
                    const wxml = mod.resource.replace(".js", ".wxml")
                    if (fs.existsSync(wxml)) {
                        const content = fs.readFileSync(wxml)
                        const len = content.length
                        compilation.assets[wxml.replace(root + "/", "")] = {
                            source: function () {
                                return content
                            },
                            size: function () {
                                return len
                            }
                        }
                    }
                })
                chunk.files.forEach(file => {
                    // let wxml = path.resolve(root, file.)
                    // if (fs.existsSync()) {

                    // }
                })
            })
            callback()
        })
    }
}


webpack({
    mode: "development",
    entry: {
        app: path.resolve(root, "app.js"),
        "pages/home/home": path.resolve(root, "pages/home/home.js"),
    },
    output: {
        path: path.resolve(root, "dist_dist")
    },
    devtool: "#hidden-source-map",
    plugins: [
        new SMI()
    ],
    module: {
        rules: [{
            test: /\.wxml$/,
            loader: function (source) {
                source
            }
        }]
    }
}).run((err, stats) => {
    if (err) {
        console.error(err.stack || err)
        // @ts-ignore
        if (err.details) {
            // @ts-ignore
            console.error(err.details)
        }
        return
    }

    const info = stats.toJson()

    if (stats.hasErrors()) {
        console.error(info.errors)
    }

    if (stats.hasWarnings()) {
        console.warn(info.warnings)
    }
})
