# auto_api_doc

根据接口文档自动生成接口文件,axios请自行封装
当前版本只接受Knife4j 与swagger-ui ，文件上传支持base64及表单文件上传，其他方式暂不支持请在自动生成后自行修改

## 安装

```
npm i auto_api_doc -g
```

## 使用方法

1. 项目目录底层新建 autoApiConfig.js 文件
2. 在 autoApiConfig.js 配置接口文档地址及封装的方法名
3. 执行 auto api 命令
```
auto api   //生成普通接口
auto mgop  //生成mgop接口
```
### autoApiConfig.js 
```
module.exports = {
  rules: [
    {
      server: "http://xxx:xxx/jx-flc-service/assets",
      apiPath: "src/http",
      axiosUnify: false,
      mgop:false,
      axiosTemplate: {
        exportObjArr: [],
        fileName: "request.js",
      },
    },
  ],
};
```
#### module.exports 
返回一个对象,rules为主要配置的部分,rules为数组,已应对项目有多个后台及服务的情况
```
module.exports = {
  rules: [

  ]
}
```
#### server: 后台接口文档地址
示例 : http://xxx:xxx/hid-danger 或 http://xxx:xxx/jx-flc-service/assets
注意 : 原地址可能为http://xxx:xxx/hid-danger/doc.html#/home 或 http://xxx:xxx/jx-flc-service/assets/swagger-ui/index.html 配置地址只需到项目名或服务名

#### apiPath 
自动生成接口所在的文件路径 可自定义 默认项目src/http

#### axiosTemplate: axios 二次封装模板 可选填
```
axiosTemplate: {
  exportObjArr: 封装的方法名，例如[post,get,put,del]等,
  fileName: axios 二次封装所在的文件名,
},
```
#### mgopName 可选填
项目接口走IRS浙江省一体化数字资源系统RPC接入的名称

<!-- #### axiosUnify -->
<!-- 接口是否统一封装，当 axiosUnify 为 true 时 fileName必填 -->