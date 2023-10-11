import axios from 'axios';
import path from 'node:path';
import fileSystem from 'file-system';
import { fileURLToPath } from 'node:url';
import ejs from 'ejs';
import fs from 'fs';
import _ from 'lodash';
import { error, success } from './loger.js';
import { dirname } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
import { command } from './getConfig.js';
import { titleCase } from './utils.js';
import { log } from 'node:console';

let axiosTemplate = ejs.compile(fs.readFileSync(path.resolve(__dirname, './template/controller.ejs')).toString('utf-8'), {});
let mgopTemplate = ejs.compile(fs.readFileSync(path.resolve(__dirname, './template/controllerMgop.ejs')).toString('utf-8'), {});
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
  while (arr.includes(path + (count || ''))) {
    count++;
  }
  return count === 0 ? path : `${path}${count}`;
};
// 指定范围内，指定个数，无重复的随机整数
const getRandomNumber = (n, min, max) => {
  let arr = [];
  for (let i = 0; i < n; i++) {
    arr[i] = parseInt(Math.random() * (max - min + 1) + min);
  }
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (arr[i] === arr[j]) {
        getRandomNumber(n, min, max);
        return false;
      }
    }
  }
  return arr;
};

const parametersFilterFun = (data, definitions) => {
  if (_.isNil(data)) {
    return {};
  } else {
    let objArr = { parametersKey: [], requestType: '', parametersObj: {} };
    let parametersArr = [];
    data.forEach((item) => {
      const { name, description } = item;
        // console.log(name,description,'objArr');
        const newObject = { [name]: description };

        parametersArr.push(newObject);
      if (item.in == 'query') {
        // const queryData = Object.entries(item).reduce((obj, [key, value]) => {
        //   obj[key] = value.description;
        //   return obj;
        // }, {});
        // const keyVal = item['name'];
        // const description = item['description'];
        // let queryData;
        // queryData[keyVal] = description;
        // console.log(queryData,'queryData');
        
        objArr.requestType = 'query';
      } else if (item.in == 'formData') {
        objArr.requestType = 'formData';
      } else {
        if (_.has(item.schema, '$ref')) {
          const isLast = item.schema['$ref'].search('«') != -1;
          const lastObj = isLast ? item.schema['$ref'].replace(/\«/g, '/').replace(/\»/g, '') : item.schema['$ref'];
          const schema = lastObj.split('/').pop();
          const data = _.pick(definitions, schema)[schema].properties;
          // const data = _.pick(definitions,item.schema['$ref'].split('/').pop())[item.schema['$ref'].split('/').pop()].properties;
          // const parameters = Object.entries(data).map(([key, value]) => {
          //   // console.log(aaa,value,"key,value");
          //   const keyVal = key;
          //   let obj = {};
          //   _.mapValues(users, 'age');
          //   console.log(obj,666);
          //   // return {aaa:value.description}
          // });
          const parameters = Object.entries(data).reduce(
            (obj, [key, value]) => {
              obj.parametersObj[key] = value.description;
              obj.parametersKey.push(key);
              return obj;
            },
            { requestType: 'body', parametersKey: [], parametersObj: {} }
          );
          objArr = parameters;
          // JSON.parse
        } else {
          if (item.in == 'path') {
            const { name, description } = item;

            // const newObject = { [name]: description };
            // objArr.push(newObject);
            objArr = { requestType: 'path', parametersKey: [name], parametersObj: { [name]: description } };
          }
        }
        // console.log(item.schema['$ref'].split('/'),'schema');
      }
    });
    if (objArr.requestType == 'query' || objArr.requestType == 'formData') {
      const arr = parametersArr;
      const object = {};
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const key = Object.keys(item)[0];
        const value = item[key];
        object[key] = value;
        objArr.parametersKey.push(key);
      }
      objArr.parametersObj = object;
    }

    return objArr;
  }
};
// const repeatedIncrement = (path, arr) => {
//   if (arr.includes(path)) {
//     return;
//   }
// };
const getMethodName = (pathArr) => {
  if (pathArr.length > 3) {
    return `${titleCase(pathArr[pathArr.length - 2])}${titleCase(pathArr[pathArr.length - 1])}`;
  } else {
    return `${titleCase(pathArr[pathArr.length - 1])}`;
  }
};
const getParametersKey = (parameters) => {
  if (parameters.parametersKey) {
    return `data = {${parameters.parametersKey ? parameters.parametersKey.map((it) => it).join(',') : ''}}`;
    //  return `data = {${parameters.parametersKey ?  parameters.parametersKey.map(it => it).join(',') : ''}}, config ={'requstType':'${parameters.requestType}'}`;
  } else {
    return undefined;
  }
};
const getApi = async (rule) => {
  try {
    const http = axios.create({
      baseURL: rule.server,
    });
    const models = await http.get(rule.models || '/v2/api-docs').then(({ data }) => {
      let nameArr = ['export', 'import', 'function'];
      let allNameArray = [];
      let methodArr = [];
      const definitions = data.definitions;
      const apiPaths = Object.entries(data.paths).map(([key, value]) => {
        let path, methodName, inputParameter, parameters;
        const regex = /{([^{}]+)}/g;

        if (key.includes('{')) {
          path = key.replace('{', '${');
          // allNameArray.push(`${key.split('/').slice(-2)[0]}`);
          methodName = getMethodName(key.split('/').slice(0, -1));
          nameArr.push(methodName);
          inputParameter = regex.exec(key)[1];
        } else {
          path = key;
          // allNameArray.push(`${key.split('/').pop()}`);
          methodName = getMethodName(key.split('/'));
          nameArr.push(methodName);
        }
        return {
          requestPath: path,
          requestPathData: inputParameter,
          ...Object.entries(value).reduce((acc, [secondKey, secondValue]) => {
            methodArr.push(secondKey.toLowerCase());
            parameters = parametersFilterFun(secondValue.parameters, definitions);
            // console.log(typeof(parameters),path,parameters,'parameters');
            // const parametersKey = "data = {"+ parameters.parametersKey || [].map(function (it) { return it; }).join(',') + "}";
            const parametersKey = getParametersKey(parameters);
            // "{params: {" + queryParameters.map(function (it) { return it.name; }).join(', ') + "}" + (configData ? ', ' + configData : '') + "}";
            //去除特殊字符~!@#$^-&*()=|{}':;',\[].<>/?~！@#￥……&*（）——|{}【】'；：""'。，、？

            //替换字符串中的所有特殊字符（包含空格）
            const pattern = /[`~!@#$^\-&*()=|{}':;',\\\[\]\.<>\/?~！@#￥……&*（）——|{}【】'；：""'。，、？\s]/g;
            return {
              ...acc,
              requestLastName: `${key.split('/').pop()}`,
              requestMethod: secondKey.toLowerCase(),
              requestMethodName: `${secondKey.toLowerCase()}${titleCase(rule.server.split('/').pop().replace(pattern, ''))}${methodName}`,
              requestSummary: secondValue.summary,
              requestConsumes: secondValue.consumes,
              requestParameters: parameters,
              requestParametersData: parametersKey,
              requestType: parameters.requestType ? parameters.requestType : 'body',
              //是否禁用
              deprecated: secondValue.deprecated || false,
            };
          }, {}),
        };
      });
      // methodArr = findDuplicates(methodArr);
      // let repeatNamelist = findDuplicates(allNameArray);
      // if (repeatNamelist.length > 0) {
      //   error(`------${repeatNamelist}--------`);
      //   error(`------以上接口名字重复或存在特殊字符export,import,function已自动修改--------`);
      // }
      generateCode(data.info, apiPaths, rule, findDuplicates(methodArr));
    });
  } catch (error) {
    console.error(`------接口配置生成失败`, error);
  }
};

const generateCode = (titleInfo, configs, rule, methodArr) => {
  const jsCode =
    command == 'api' ? axiosTemplate({ titleInfo, configs, rule, methodArr }) : mgopTemplate({ titleInfo, configs, rule, methodArr });
  fileSystem.writeFileSync(
    path.join(path.join(process.cwd(), rule.apiPath || 'src/server'), rule.fileName || `${rule.server.split('/').pop()}Api.js`),
    jsCode,
    {
      encoding: 'utf-8',
    }
  );
  console.log(rule.fileName);
  rule.fileName != undefined
    ? success(`------${rule.fileName + '接口文件已生成-----'}`)
    : success(`------${rule.server.split('/').pop() + 'Api.js接口文件已生成-----'}`);
};

export { getApi };
