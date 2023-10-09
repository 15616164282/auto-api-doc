import fs from 'fs';
// 最新 node 核心包的导入写法
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname } from 'node:path';
import path from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
import { error, success } from './loger.js';
import { getApi } from './getApi.js';
import { validator } from './validator.js';
// const fs = require("fs");
// const fileURLToPath = require("node:url");
// const dirname = require("node:path");
// // const __dirname = dirname(fileURLToPath(import.meta.url));
// const { error, success } = require("./loger.js");
// 按照linux的规范，一般成功用0表示，而非0则表示失败。那么process.exit也遵循这个规范

// process.exit(0)表示成功完成，回调函数中，err将为null；

// process.exit(非0)表示执行失败，回调函数中，err不为null，err.code就是我们传给exit的数字。

/**  
 @getConfig 获取配置文件路径判断是否配置接口封装模板
 */
let config;
let command;
const getConfig = async (commandVal) => {
  command = commandVal;
  const filepath = path.resolve(process.cwd(), 'autoApiConfig.js');
  if (fs.existsSync(filepath)) {
    try {
      config = await import(pathToFileURL(filepath));
      success('导入配置成功----');
      if (validator(config)) {
        for (const rule of config.default.rules) {
          console.log(rule.axiosUnify,rule, 'rule.axiosUnify');
          if (!rule.axiosUnify) {
            console.log(process.cwd(), rule.apiPath, rule.axiosTemplate, 'path');
            const axiosTemplatePath = path.resolve(process.cwd(), rule.apiPath, rule.axiosTemplate.fileName);
            if (fs.existsSync(axiosTemplatePath)) {
              rule.axiosTemplatePath = axiosTemplatePath;
              getApi(rule);
            } else {
              error(`当前目录${path.resolve(process.cwd(), rule.apiPath)}不存在rule.axiosTemplate配置的${rule.axiosTemplate}------`);
              process.exit(0);
            }
          } else {
            getApi(rule);
          }
        }
      } else {
        error('-----请在autoApiConfig.js中rules.server配置接口服务地址-------');
        process.exit(0);
      }
    } catch (error) {
      console.error(`生成接口失败`, error);
      process.exit(0);
    }
  } else {
    error('------当前目录不存在autoApiConfig.js------');
    process.exit(0);
  }
};
export { getConfig ,command};
