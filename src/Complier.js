const JsonResource = require("./Resource.json.js")

const JsResource = require("./Resource.js.js")

const WXMLResource = require("./Resource.wxml")

const createResource = require("./createResource")

const Component = require("./Component")
const Page = require("./Page")
const Resource = require("./Resource")
const path = require("path")

module.exports = class Complier {
    constructor(palettes) {
        this.files = new Map()
        this.pages = new Map()
        this.components = new Map()
        this.palettes = palettes
        this.root = process.cwd()
        this.dist = path.resolve(this.root, "dist")
    }
    /**
     *
     * @param {String} pagePath 绝对路径
     */
    addPage(pagePath) {
        if (this.pages.has(pagePath)) return
        const page = new Page(pagePath, this.palettes)
        this.pages.set(pagePath, page)
        this.addResource(page.wxml.path, page.wxml)
        page.wxml.pages.forEach(page => {
            this.addPage(page)
        })
        page.wxml.requires.forEach(file => {
            this.addResource(file)
        })
        this.addResource(page.js.path, page.js)
        page.js.pages.forEach(page => {
            this.addPage(page)
        })
        page.js.requires.forEach(file => {
            this.addResource(file)
        })
        this.addResource(page.json.path, page.json)
        page.json.components.forEach(component => {
            this.addComponent(component)
        })

        this.addResource(page.style.path, page.style)
    }
    /**
     *
     * @param {String} componentPath 绝对路径
     */
    addComponent(componentPath) {
        if (this.components.has(componentPath)) return
        const component = new Component(componentPath, this.palettes)
        this.components.set(componentPath, component)

        this.addResource(component.wxml.path, component.wxml)

        component.wxml.pages.forEach(page => {
            this.addPage(page)
        })
        component.wxml.requires.forEach(file => {
            this.addResource(file)
        })

        this.addResource(component.js.path, component.js)

        component.js.pages.forEach(page => {
            this.addPage(page)
        })
        component.js.requires.forEach(file => {
            this.addResource(file)
        })

        this.addResource(component.json.path, component.json)
        component.json.components.forEach(component => {
            this.addComponent(component)
        })
        this.addResource(component.style.path, component.style)
    }
    /**
     *
     * @param {String} filePath 绝对路径
     * @param {Resource=} Res 文件对象
     */
    addResource(filePath, Res) {
        if (this.files.has(filePath)) return
        if (!Res) {
            Res = createResource(filePath, this.palettes)
            if (Res instanceof WXMLResource) {
                this.addResource(filePath.replace(/\.wxml$/, ".wxss"))
                Res.pages.forEach(page => {
                    this.addPage(page)
                })
                Res.requires.forEach(file => {
                    this.addResource(file)
                })
            } else if (Res instanceof JsResource) {
                Res.pages.forEach(page => {
                    this.addPage(page)
                })
                Res.requires.forEach(file => {
                    this.addResource(file)
                })
            } else if (Res instanceof JsonResource) {
                Res.components.forEach(component => {
                    this.addComponent(component)
                })
            } else if (!(Res instanceof Resource)) {
                console.log("[资源类型错误]", Res)
            }
        }
        this.files.set(filePath, Res)
    }
    updateResource(appJsonPath, config) {
        this.files.set(appJsonPath, new JsonResource(appJsonPath, config))
    }
    output() {
        let result = true
        this.files.forEach(file => { result = file.write() && result })
        if (!result) {
            console.log("⚠️ 构建有缺陷")
        } else {
            console.log("🏄‍♂️ 构建成功")
        }
    }
}
