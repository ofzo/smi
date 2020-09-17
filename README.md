# smi
小程序打包器

支持 subPackages, 任何不再subPackages中定义的页面将分发到主包中

node_modules中的页面和组件会提取到dist目录下

#编译结构
```js
Files = {
    "/pages/home/home.wxml": File {
        path: "/pages/home/home.wxml",
        output: "/dist/pages/home/home.wxml",
        content: "XXXXX",
        requires: [ "/pages/me/me.wxml", "/pages/me/me.scss", "/pages/me/me.json", "/pages/me/me.js", "/pages/other/other", "/images/home.png"],
    },
    "/images/home.png": File{
        path: "/images/home.png",
        output: "/dist/images/home.png",
        content: "XXXXXX",
        requires: []
    }
}

Page {
    wxml: "/pages/home/home.wxml",
    json: "/pages/home/home.wxml",
    js: "/pages/home/home.js",
    style: "/pages/home/home.scss"
}

Component {
    wxml: "/pages/home/home.wxml",
    json: "/pages/home/home.wxml",
    js: "/pages/home/home.js",
    style: "/pages/home/home.scss"
}

completion = {
    files: Files{ },
    pages: { "/pages/home/home": Page{} },
    components: { "/components/button/button": Component{ } }
}
```

#build
默认会检查执行目录的 .env 文件
可在执行时添加env文件， 默认为beta.env

```js
npx smi beta.env
```
