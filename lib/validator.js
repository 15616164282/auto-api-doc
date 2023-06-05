import { error } from "./loger.js";

export function validator(config) {
  console.log(config);
  let flag = true;
  if (!config || !config.default.rules || !Array.isArray(config.default.rules)) {
    error("rules字段必须是数组");
    flag = false;
    return flag;
  }
  for (const rule of config.default.rules) {
    if (!rule.server) {
      error("rule.server是必填项,例如http://localhost:8080或者http://localhost:8080/api/a");
      flag = false;
    }
    if (!rule.axiosUnify) {
      if (!rule.axiosTemplate) {
        error("当rule.axiosUnify为false时，rule.axiosTemplate是必填项,接口请求封装文件名");
        flag = false;
      }
    }
    // if (!rule.axiosTemplate) {
    //   error("rule.axiosTemplate是必填项,接口请求封装文件名");
    //   flag = false;
    // }
  }
  return flag;
}
