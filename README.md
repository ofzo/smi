# smi
小程序打包器


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
