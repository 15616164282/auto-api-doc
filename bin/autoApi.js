#! /usr/bin/env node

import { program } from "commander";
import { getConfig } from "../lib/getConfig.js";
// let program = require("commander");
// let getConfig = require("../lib/getConfig.js");
console.log("init--------");

program
  .command("api [config_file_path]")
  .description("使用当前路径下的autoApiConfig.js配置文件生成后台对应接口文件")
  .action(function (filepath) {
    console.log("Auto Api");
    getConfig();
  });

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}
