#!/usr/bin/env node
require("colors")
console.log("current smi version", require("./package.json").version.green)
require("./src/main")
