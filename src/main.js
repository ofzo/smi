const requireResolve = require("./requireResolve")

const cleanup = require("./cleanup")

const path = require("path")
const fs = require("fs")
const Complier = require("./Complier")
const root = process.cwd()
const dist = path.resolve(root, "dist")

cleanup(dist)
let env = ""
if (fs.existsSync(path.resolve(root, ".env"))) {
    env = fs.readFileSync(path.resolve(root, ".env")).toString() + "\n"
}
(env + fs.readFileSync(path.resolve(root, process.argv[2] || "beta.env")).toString()).trim().split("\n").forEach(item => {
    if (!item.trim() || /^\/\//.test(item) || /^#/.test(item)) {
        return
    }
    const index = item.indexOf("=")
    const key = item.slice(0, index)
    let value = item.slice(index + 1).trim()
    if (key.toUpperCase() === "VERSION") {
        const date = new Date()
        const year = date.getFullYear().toString().slice(2)
        const month = date.getMonth() + 1
        const day = date.getDate()
        value += `/${year}.${month > 9 ? month : "0" + month}.${day > 9 ? day : "0" + day}`.trim()
    }
    process.env[key] = value
})
// @ts-ignore
process.env.__PROD__ = false
const appJsonPath = path.resolve(root, "app.json")
const appJsPath = path.resolve(root, "app.js")
const appStylePath = path.resolve(root, "app.scss")
const projectConfigPath = path.resolve(root, "project.config.json")
const siteMapPath = path.resolve(root, "sitemap.json")

const appJson = require(appJsonPath)
const projectConfig = require(projectConfigPath)
let palettes
if (appJson.palettes) {
    appJson.palettes.forEach(palette => {
        const palettePath = path.resolve(root, palette)
        if (fs.existsSync(palettePath)) {
            const ext = palette.split(".").pop()
            palettes = { [ext]: fs.readFileSync(palettePath).toString() }
        }
    })
    delete appJson.palettes
}

const complier = new Complier(palettes)


debugger

if (appJson.pages)
    appJson.pages.forEach(page => {
        const pagePath = requireResolve(page, root)
        // @ts-ignore
        complier.addPage(pagePath)
    })

if (appJson.tabBar)
    appJson.tabBar.list.forEach(tab => {
        tab.iconPath = tab.iconPath.slice(1)
        complier.addResource(path.resolve(root, tab.iconPath))
        tab.selectedIconPath = tab.selectedIconPath.slice(1)
        complier.addResource(path.resolve(root, tab.selectedIconPath))
        // @ts-ignore
        complier.addPage(requireResolve(tab.pagePath, root))
        tab.pagePath = tab.pagePath.slice(1)
    })
if (appJson.subPackages)
    appJson.subPackages.forEach(pack => {
        const packageRoot = requireResolve(pack.root)
        if (pack.root.startsWith("@") || pack.root.startsWith("/")) {
            pack.root = pack.root.slice(1)
        }
        pack.pages = pack.pages.map(page => {
            // @ts-ignore
            complier.addPage(path.resolve(packageRoot, page))
            return page
        })
    })
if (appJson.files)
    appJson.files.forEach(file => {
        complier.addResource(file)
    })
appJson.pages = []
delete appJson.files


complier.addResource(appJsPath)
complier.addResource(appStylePath)
complier.addResource(siteMapPath)

complier.pages.forEach((page) => {
    if (appJson.subPackages) {
        if (page.pagePath.startsWith("pages/")) {
            appJson.pages.push(page.pagePath)
        }
    } else {
        appJson.pages.push(page.pagePath)
    }
})
complier.updateResource(appJsonPath, appJson)

projectConfig.appid = process.env.APP_ID
projectConfig.libVersion = process.env.SDK_VERSION
complier.updateResource(projectConfigPath, projectConfig)

complier.output()
