module.exports = {
    extends: [
        // "prettier",
        // "prettier/standard"
    ],
    plugins: [
        // "prettier"
    ],
    parser: "babel-eslint",
    parserOptions: {
        "ecmaVersion": 7,
        "sourceType": "module"
    },
    env: {
        "node": true,
        "es6": true,
        "commonjs": true
    },
    rules: {
        // ✅ 禁止使用tab缩进
        "no-tabs": "error",
        // ✅ 换行符样式
        "linebreak-style": [
            "error",
            "unix"
        ],
        // 🔨 使用双引号
        quotes: [
            "error",
            "double"
        ],
        // 🔨 不需要末尾的 ;
        semi: [
            "error",
            "never"
        ],
        // ✅ 强制使用 === 和 !==
        eqeqeq: "error",
        // ✅ 要求调用无参构造函数时有圆括号
        "new-parens": "error",
        // ✅ 禁止使用eval
        "no-eval": "error",
        "require-jsdoc": "off",
        // ✅ generator 函数需要 yield
        "require-yield": "error",
        // ✅ async 函数需要 yield
        "require-await": "error",
        // ✅ 🔨 不使用var定义变量
        "no-var": "error",
        "valid-jsdoc": "off",
        // ✅ 禁止在注释中使用特定的警告术语 todo , fixme
        "no-warning-comments": "warn",
        // 🔨 文件末尾需要一个空行
        "eol-last": [
            "warn",
            "always"
        ],
        // 禁止出现空函数
        "no-empty-function": "warn",
        // 🔨 禁止使用多个空格
        "no-multi-spaces": "error",
        // ✅ 禁用 with
        "no-with": "error",
        // 🔨 要求或禁止 “Yoda” 条件
        yoda: "error",
        "no-unused-vars": "warn",
        // ✅ 禁止 this 关键字出现在类和类对象之外
        "no-invalid-this": "error",
        // 禁止在常规字符串中出现模板字面量占位符语法
        "no-template-curly-in-string": "error",
        // 🔨 禁止冗余的括号
        "no-extra-parens": "error",
        // 🔨 要求 IIFE 使用括号括起来
        "wrap-iife": "error",
        "new-cap": "off",
        "no-inner-declarations": "warn",
        // 🔨 禁止初始化为 undefined
        "no-undef-init": "error",
        // ✅ 禁止将 undefined 作为标识符
        "no-undefined": "error",
        // ✅ 禁用未定义的变量
        "no-undef": "error",
        // 警告多余的空行
        "no-multiple-empty-lines": "warn",
        // ✅ 禁用自身比较
        "no-self-compare": "error",
        // ✅ 禁止一层比变的循环条件
        "no-unmodified-loop-condition": "error",
        // ✅ 禁止操作__proto__
        "no-proto": "error",
        // 禁止用 new 调用Function
        "no-new-func": "error",
        // 数组方法必须有返回值
        "array-callback-return": "error",
        // 🔨 尽量使用 const
        "prefer-const": "error",
        "no-const-assign": "error",
        // 🔨 尽量使用 spread
        "prefer-spread": "error",
        "no-return-await": "off",
        "space-before-function-paren": "off"
    },
}
