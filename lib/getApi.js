import axios from "axios";
import path from "node:path";
import fileSystem from "file-system";
import { fileURLToPath, pathToFileURL } from "node:url";
import ejs from "ejs";
import fs from "fs";
import _ from "lodash";
import { error, success } from "./loger.js";
import { dirname } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));

let template = ejs.compile(fs.readFileSync(path.resolve(__dirname, "./template/controller.ejs")).toString("utf-8"), {});
const findDuplicates = (arr) => {
  return arr.reduce((acc, value, index, arr) => {
    if (arr.indexOf(value) !== index && acc.indexOf(value) === -1) {
      acc.push(value);
    }
    return acc;
  }, []);
};
const makeDistinct = (arr, path) => {
  let count = 0;
  while (arr.includes(path + (count || ""))) {
    count++;
  }
  return count === 0 ? path : `${path}${count}`;
};
const repeatedIncrement = (path, arr) => {
  if (arr.includes(path)) {
    return;
  }
};
const getApi = async (rule) => {
  try {
    const http = axios.create({
      baseURL: rule.server,
    });
    const models = await http.get(rule.models || "/v2/api-docs").then(({ data }) => {
      let nameArr = ["export", "import", "function"];
      let allNameArray = [];
      let methodArr = [];
      const apiPaths = Object.entries(data.paths).map(([key, value]) => {
        let path, methodName, inputParameter;
        const regex = /{([^{}]+)}/g;

        if (key.includes("{")) {
          path = key.replace("{", "${");
          allNameArray.push(`${key.split("/").slice(-2)[0]}`);
          methodName = makeDistinct(nameArr, `${key.split("/").slice(-2)[0]}`);
          nameArr.push(methodName);
          inputParameter = regex.exec(key)[1];
        } else {
          path = key;
          allNameArray.push(`${key.split("/").pop()}`);
          methodName = makeDistinct(nameArr, `${key.split("/").pop()}`);
          nameArr.push(methodName);
        }
        return {
          requestPath: path,
          requestData: inputParameter,
          ...Object.entries(value).reduce((acc, [secondKey, secondValue]) => {
            methodArr.push(secondKey.toLowerCase());
            return {
              ...acc,
              requestMethod: secondKey.toLowerCase(),
              requestMethodName: methodName,
              requestSummary: secondValue.summary,
              requestConsumes: secondValue.consumes,
              //是否禁用
              deprecated: secondValue.deprecated || false,
            };
          }, {}),
        };
      });
      methodArr = findDuplicates(methodArr);
      let repeatNamelist = findDuplicates(allNameArray);
      if (repeatNamelist.length > 0) {
        error(`------${repeatNamelist}--------`);
        error(`------以上接口名字重复或存在特殊字符export,import,function已自动修改--------`);
      }
      console.log(methodArr, apiPaths);
      generateCode(data.info, apiPaths, rule, methodArr);
    });
  } catch (error) {
    console.error(`------接口配置生成失败`, error);
  }
};

const generateCode = (titleInfo, configs, rule, methodArr) => {
  const jsCode = template({ titleInfo, configs, rule, methodArr });
  fileSystem.writeFileSync(
    path.join(path.join(process.cwd(), rule.apiPath || "src/http"), rule.fileName || `${rule.server.split("/").pop()}Api.js`),
    jsCode,
    { encoding: "utf-8" }
  );
  success(`------${rule.server.split("/").pop()}Api.js接口文件已生成-----`);
};

export { getApi };
