const MResource = require("./MResource.js")

const { webComplier, mfsRead } = require("./web-complier.js")

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
        this.modules = new Set()
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
        page.js.modules.forEach(file => {
            if (this.files.has(file.path)) return
            this.modules.add(file)
        })
        this.addResource(page.json.path, page.json)
        page.json.components.forEach(component => {
            this.addComponent(component)
        })

        this.addResource(page.style.path, page.style)
        page.style.requires.forEach(style => {
            this.addResource(style)
        })
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
        component.js.modules.forEach(file => {
            if (this.files.has(file.path)) return
            this.modules.add(file)
        })

        this.addResource(component.json.path, component.json)
        component.json.components.forEach(component => {
            this.addComponent(component)
        })
        this.addResource(component.style.path, component.style)
        component.style.requires.forEach(style => {
            this.addResource(style)
        })
    }
    /**
     *
     * @param {String} filePath 绝对路径
     * @param {Resource=} Res 文件对象
     */
    addResource(filePath, Res) {
        if (this.files.has(filePath))
            return
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
                Res.modules.forEach(module => {
                    if (this.files.has(module.path)) return
                    this.modules.add(module)
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
    async complierModules() {
        const modules = [...this.modules]
        for (let index = 0; index < modules.length; index++) {
            const module = modules[index]
            const output = path.resolve(this.root, "dist/miniprogram_npm", module.name)
            await webComplier(module.path, output)
            const content = mfsRead(path.resolve(output, "index.js"))
            const contentMap = mfsRead(path.resolve(output, "index.js.map"))
            const res = new MResource(module.path, path.resolve(output, "index.js"), content)
            const resMap = new MResource(module.path + ".map", path.resolve(output, "index.js.map"), contentMap)
            this.files.set(module.path, res)
            this.files.set(module.path + ".map", resMap)
        }
    }
    updateResource(appJsonPath, config) {
        this.files.set(appJsonPath, new JsonResource(appJsonPath, config))
    }

    async output(env) {
        let result = true
        await this.complierModules()
        this.files.forEach(file => { result = file.write() && result })
        if (!result) {
            console.log("\n⚠️ 构建有缺陷".yellow + ` (${env}) ${new Date()}`)
        } else {
            console.log("\n🏄‍♂️ 构建成功".green + ` (${env}) ${new Date()}`)
        }
    }
}
