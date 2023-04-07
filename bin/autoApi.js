#! /usr/bin/env node

import { getConfig } from "../lib/getConfig.js";
console.log("init--------");
getConfig();

// async function init() {
//   console.log("init--------");
// }
// async function compress() {
//   console.log("compress--------");
// }
// async function package() {
//   console.log("package--------------");
// }
// var program = require("commander");
// program
//   .version("0.0.1", "-v,--version")
//   //接受外部传来的参数
//   .arguments("<cmd> [env]")
//   //对这个命令行的整体描述
//   .description("你好zhangxiaoman")
//   //这是一个命令参数，允许带多个参数
//   //-n  1 2 3
//   .option("-n, --number <numbers...>", "specify numbers")
//   //这是一个命令参数，如果外界的命令参数中带有这个字符，则表示要启动
//   //下面这个字符对应的init函数
//   .option("-i, --init", "init")
//   //这是一个命令参数，如果外界的命令参数中带有这个字符，则表示要启动
//   //下面这个字符对应的compress函数
//   .option("-c, --compress", "compress")
//   //这是一个命令参数，如果外界的命令参数中带有这个字符，则表示要启动
//   //下面这个字符对应的package函数
//   .option("-p, --package", "package")
//   //外部传来参数时会触发这个函数arguments('<cmd> [env]')
//   .action(function (cmd, env) {
//     console.log("执行action");
//     cmdValue = cmd;
//     envValue = env;
//   })
//   .parse(process.argv);
// console.log("command:", cmdValue);
// console.log("environment:", envValue || "no environment given");
// (async () => {
//   if (program.init) {
//     await init();
//     console.log("初始化完毕");
//   }
//   if (program.compress) {
//     await compress();
//     console.log("压缩完成");
//   }
//   if (program.package) {
//     await package();
//     console.log("打包完成");
//   }
// })();
