import fs from "fs";
// 最新 node 核心包的导入写法
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import path from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));
import { error, success } from "./loger.js";
// 按照linux的规范，一般成功用0表示，而非0则表示失败。那么process.exit也遵循这个规范

// process.exit(0)表示成功完成，回调函数中，err将为null；

// process.exit(非0)表示执行失败，回调函数中，err不为null，err.code就是我们传给exit的数字。
export const getConfig = () => {
  const folderPath = path.join(__dirname, "autoApiConfig.js");
  success(folderPath);
  if (fs.existsSync(folderPath)) {
    const config = require(folderPath);
    console.log("文件夹存在！");
  } else {
    console.log("文件夹不存在！");
  }
};
