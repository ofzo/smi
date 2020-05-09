const path = require("path")
const fs = require("fs")
const { cleanup } = require("./cleanup")
const complierJs = require("./complierJs")
const complierJson = require("./complierJson")
const complierWxml = require("./complierWxml")
const complierStyle = require("./complierStyle")
const resolvePath = require("./resolvePath")

const root = process.cwd()
const dist = path.resolve(root, "dist")

cleanup(dist)

fs.readFileSync(path.resolve(root, "beta.env")).toString().trim().split("\n").forEach(item => {
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

// 构建 completion 对象
const completion = {
    files: new Map(),
    pages: new Map(),
    components: new Map(),
    projectConfig: require(path.resolve(root, "project.config.json")),
    appJson: require(path.resolve(root, "app.json")),
    appJs: complierJs(path.resolve(root, "app.js")),
    appStyle: {},
    siteMap: require(path.resolve(root, "sitemap.json")),
    palettes: {}
}

if (completion.appJson.palettes) {
    completion.appJson.palettes.forEach(palette => {
        const palettePath = path.resolve(root, palette)
        if (fs.existsSync(palettePath)) {
            const ext = palette.split(".").pop()
            completion.palettes = { [ext]: fs.readFileSync(palettePath).toString() }
        }
    })
    delete completion.appJson.palettes
}
completion.appStyle = complierStyle(path.resolve(root, "app.scss"), completion.palettes)

if (completion.appJson.pages) {
    completion.appJson.pages.forEach(page => genPage(resolvePath(page)))
}
if (completion.appJson.files) {
    completion.appJson.files.forEach(file => genFile(resolvePath(file)))
    delete completion.appJson.files
}
if (completion.appJson.tabBar) {
    completion.appJson.tabBar.list.forEach(tab => {
        genFile(path.resolve(root, tab.iconPath))
        genFile(path.resolve(root, tab.selectedIconPath))
        genPage(tab)
    })
}

function genPage(pagePath, origin = root) {
    if (completion.pages.has(pagePath)) return

    let stylePath = ""
    if (fs.existsSync(path.resolve(origin, pagePath + ".wxss")))
        stylePath = path.resolve(origin, pagePath + ".wxss")
    else if (fs.existsSync(path.resolve(origin, pagePath + ".scss")))
        stylePath = path.resolve(origin, pagePath + ".scss")

    const page = {
        wxml: complierWxml(path.resolve(origin, pagePath + ".wxml")),
        js: complierJs(path.resolve(origin, pagePath + ".js")),
        style: complierStyle(stylePath, completion.palettes),
        json: complierJson(path.resolve(origin, pagePath + ".json"))
    }


    page.json.dependencies.forEach((value) => {
        genComponent(value)
    })
    page.js.pages.forEach(p => genPage(p, path.resolve(page.js.path, "..")))

    page.js.dependencies.forEach(ipt => {
        genFile(ipt)
    })

    page.style.dependencies.forEach(ipt => {
        genFile(ipt)
    })
    page.wxml.pages.forEach(p => genPage(p, path.resolve(page.wxml.path, "..")))
    page.wxml.dependencies.forEach(p => genFile(p))

    completion.pages.set(pagePath, page)
}

function genComponent(componentPath, origin = root) {
    if (completion.components.has(componentPath)) return
    let stylePath = ""
    if (fs.existsSync(path.resolve(origin, componentPath + ".wxss")))
        stylePath = path.resolve(origin, componentPath + ".wxss")
    else if (fs.existsSync(path.resolve(origin, componentPath + ".scss")))
        stylePath = path.resolve(origin, componentPath + ".scss")

    const component = {
        wxml: complierWxml(path.resolve(origin, componentPath + ".wxml")),
        js: complierJs(path.resolve(origin, componentPath + ".js")),
        style: complierStyle(stylePath, completion.palettes),
        json: complierJson(path.resolve(origin, componentPath + ".json"))
    }


    component.json.dependencies.forEach((value) => {
        genComponent(value)
    })

    component.js.pages.forEach(p => genPage(p, path.resolve(component.js.path, "..")))

    component.js.dependencies.forEach(ipt => {
        genFile(ipt)
    })
    component.style.dependencies.forEach(ipt => {
        genFile(ipt)
    })

    component.wxml.pages.forEach(p => genPage(p, path.resolve(component.wxml.path, "..")))
    component.wxml.dependencies.forEach(p => genFile(p))

    completion.components.set(componentPath, component)
}


function genFile(filePath) {
    if (completion.files.has(filePath)) return

    if (fs.existsSync(filePath)) {
        const ext = filePath.split(".").pop()
        let file
        if (ext === "wxml") {
            file = complierWxml(filePath)
            file.pages.forEach(p => genPage(p, path.resolve(file.path, "..")))
            file.dependencies.forEach(p => genFile(p))
            const wxssFromWxml = filePath.replace(ext, "wxss")
            const scssFromWxml = filePath.replace(ext, "scss")
            if (fs.existsSync(wxssFromWxml)) {
                genFile(wxssFromWxml)
            } else if (fs.existsSync(scssFromWxml)) {
                genFile(scssFromWxml)
            }
        } else if (ext === "json") {
            file = complierJson(filePath)
            file.dependencies.forEach(p => genFile(p))
        } else if (ext === "js") {
            file = complierJs(filePath)
            file.pages.forEach(p => genPage(p, path.resolve(file.path, "..")))
            file.dependencies.forEach(p => genFile(p))
        } else if (ext === "scss" || ext === "wxss") {
            file = complierStyle(filePath, completion.palettes)
            file.dependencies.forEach(p => genFile(p))
        } else {
            file = {
                path: filePath,
                source: fs.readFileSync(filePath),
                output: fs.readFileSync(filePath)
            }
        }
        completion.files.set(filePath, file)
    } else {
        console.log("[文件未发现]:", filePath)
    }
}
completion.appJs.dependencies.forEach(dep => {
    genFile(dep)
})
completion.appJs.pages.forEach(page => {
    genPage(page)
})
// console.log(completion)
function outputFiles() {
    completion.files.forEach((file, key) => {
        const abs = key.replace(root, dist).replace("node_modules/", "")
        mkdirP(abs)
        fs.writeFileSync(abs, file.output)
    })
    completion.components.forEach((component, key) => {
        const abs = key.replace(root, dist)
        mkdirP(abs)
        fs.writeFileSync(abs + ".wxml", component.wxml.output)
        fs.writeFileSync(abs + ".wxss", component.style.output)
        fs.writeFileSync(abs + ".js", component.js.output)
        fs.writeFileSync(abs + ".json", JSON.stringify(component.json.output, 4))
    })
    completion.pages.forEach((page, key) => {
        const abs = key.replace(root, dist)
        mkdirP(abs)
        fs.writeFileSync(abs + ".wxml", page.wxml.output)
        fs.writeFileSync(abs + ".wxss", page.style.output)
        fs.writeFileSync(abs + ".js", page.js.output)
        fs.writeFileSync(abs + ".json", JSON.stringify(page.json.output, 4))
    })
    fs.writeFileSync(path.resolve(dist, "app.js"), completion.appJs.output)
    fs.writeFileSync(path.resolve(dist, "app.json"), JSON.stringify(completion.appJson, 4))
    fs.writeFileSync(path.resolve(dist, "app.wxss"), completion.appStyle.output)
    fs.writeFileSync(path.resolve(dist, "project.config.json"), JSON.stringify(completion.projectConfig, 4))
    fs.writeFileSync(path.resolve(dist, "sitemap.json"), JSON.stringify(completion.siteMap, 4))
}

function mkdirP(filePath) {

    const paths = filePath.replace(root, "").split("/").slice(0, -1)
    let current = root
    paths.forEach(dir => {
        current = path.resolve(current, dir)
        if (!fs.existsSync(current) || !fs.statSync(current).isDirectory()) {
            fs.mkdirSync(current)
        }
    })
}


outputFiles()
