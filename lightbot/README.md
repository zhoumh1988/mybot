#Lightbot 光链微信群管理机器人

## 安装模块

项目是用pm2启动到，因此需要添加全局的pm2模块，已安装忽略本条。
```ssh
npm install pm2 -g
```

安装依赖模块
```ssh
npm install
```

## 启动服务
```ssh
npm start
```

## 重启服务
```ssh
npm restart
```

## 停止服务
```ssh
npm stop
```

## 查看服务日志
```ssh
pm2 logs lightbot
```

## lightbot.json解读
```json
{
    "apps" : [{
      "name"        : "lightbot", // 服务名称
      "script"      : "./lightbot.js", // 主程序js
      "watch"       : false, // 是否监听文件改变，不可更改。设置true后会死循环
      "env": {
        "WECHATY_PUPPET": "padchat", // wechaty服务启动模式
        "WECHATY_PUPPET_PADCHAT_TOKEN": "padchat-token-LittleStrongZhou", // wechaty token github上申请
        "WECHATY_LOG": "info", // 日志级别，常用info和silly
        "NODE_ENV": "development" // 启动配置时需要传到配置名称，可看package.json里，-env development
      }
    }]
}
```

## 目录结构
```
- logs 日志文件
- model 对象类
    - User.js 用户对象
- plugin 外部插件集成
- service 核心代码
    - DB.js 数据库基础
    - Query.js 所有到数据库请求封装
- config.js 全局变量配置
- lightbot.js 机器人主程序入口
- lightbot.json pm2启动配置
- package.json 项目配置
```