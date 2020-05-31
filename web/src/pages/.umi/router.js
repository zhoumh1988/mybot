import React from 'react';
import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from 'umi/dynamic';
import renderRoutes from 'umi/_renderRoutes';
import { routerRedux } from 'dva/router';



let Router = DefaultRouter;
const { ConnectedRouter } = routerRedux;
Router = ConnectedRouter;


let routes = [
  {
    "path": "/",
    "component": require('../../layouts/index.js').default,
    "routes": [
      {
        "path": "/404",
        "exact": true,
        "component": require('../404.js').default
      },
      {
        "path": "/",
        "exact": true,
        "component": require('../index.js').default
      },
      {
        "path": "/dashboard/totalLine",
        "exact": true,
        "component": require('../dashboard/totalLine.js').default
      },
      {
        "path": "/dashboard/totalWord",
        "exact": true,
        "component": require('../dashboard/totalWord.js').default
      },
      {
        "path": "/dashboard/userLine",
        "exact": true,
        "component": require('../dashboard/userLine.js').default
      },
      {
        "path": "/dashboard/userWord",
        "exact": true,
        "component": require('../dashboard/userWord.js').default
      },
      {
        "path": "/fouls/form",
        "exact": true,
        "component": require('../fouls/form.js').default
      },
      {
        "path": "/fouls",
        "exact": true,
        "component": require('../fouls/index.js').default
      },
      {
        "path": "/group",
        "exact": true,
        "component": require('../group/index.js').default
      },
      {
        "path": "/group/table",
        "exact": true,
        "component": require('../group/table.js').default
      },
      {
        "path": "/group/word",
        "exact": true,
        "component": require('../group/word.js').default
      },
      {
        "path": "/contact",
        "exact": true,
        "component": require('../contact/index.js').default
      },
      {
        "path": "/illegalUser/BakModal",
        "exact": true,
        "component": require('../illegalUser/BakModal.js').default
      },
      {
        "path": "/illegalUser/delBakModal",
        "exact": true,
        "component": require('../illegalUser/delBakModal.js').default
      },
      {
        "path": "/illegalUser/form",
        "exact": true,
        "component": require('../illegalUser/form.js').default
      },
      {
        "path": "/illegalUser",
        "exact": true,
        "component": require('../illegalUser/index.js').default
      },
      {
        "path": "/keywords/form",
        "exact": true,
        "component": require('../keywords/form.js').default
      },
      {
        "path": "/keywords",
        "exact": true,
        "component": require('../keywords/index.js').default
      },
      {
        "path": "/login",
        "exact": true,
        "component": require('../login/index.js').default
      },
      {
        "path": "/rooms",
        "exact": true,
        "component": require('../rooms/index.js').default
      },
      {
        "path": "/chats/BakModal",
        "exact": true,
        "component": require('../chats/BakModal.js').default
      },
      {
        "path": "/chats",
        "exact": true,
        "component": require('../chats/index.js').default
      },
      {
        "path": "/settings",
        "exact": true,
        "component": require('../settings/index.js').default
      },
      {
        "path": "/chat-model/SearchForm",
        "exact": true,
        "component": require('../chat-model/SearchForm.js').default
      },
      {
        "path": "/chat-model",
        "exact": true,
        "component": require('../chat-model/index.js').default
      },
      {
        "path": "/stat/chats",
        "exact": true,
        "component": require('../stat/chats.js').default
      },
      {
        "path": "/stat/keyword",
        "exact": true,
        "component": require('../stat/keyword.js').default
      },
      {
        "path": "/stat/userinfo",
        "exact": true,
        "component": require('../stat/userinfo.js').default
      },
      {
        "path": "/account/addUser",
        "exact": true,
        "component": require('../account/addUser.js').default
      },
      {
        "path": "/account",
        "exact": true,
        "component": require('../account/index.js').default
      },
      {
        "path": "/account/userInfo",
        "exact": true,
        "component": require('../account/userInfo.js').default
      },
      {
        "path": "/stat-admin",
        "exact": true,
        "component": require('../stat-admin/index.js').default
      },
      {
        "path": "/stat-admin/word",
        "exact": true,
        "component": require('../stat-admin/word.js').default
      },
      {
        "path": "/home",
        "exact": true,
        "component": require('../home/index.js').default
      },
      {
        "component": () => React.createElement(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/node_modules/umi-build-dev/lib/plugins/404/NotFound.js').default, { pagesPath: 'src/pages', routes: '[{"path":"/","component":"./src/layouts/index.js","routes":[{"path":"/404","exact":true,"component":"./src/pages/404.js"},{"path":"/","exact":true,"component":"./src/pages/index.js"},{"path":"/dashboard/service","exact":true,"component":"./src/pages/dashboard/service.js"},{"path":"/dashboard/totalLine","exact":true,"component":"./src/pages/dashboard/totalLine.js"},{"path":"/dashboard/totalWord","exact":true,"component":"./src/pages/dashboard/totalWord.js"},{"path":"/dashboard/userLine","exact":true,"component":"./src/pages/dashboard/userLine.js"},{"path":"/dashboard/userWord","exact":true,"component":"./src/pages/dashboard/userWord.js"},{"path":"/fouls/form","exact":true,"component":"./src/pages/fouls/form.js"},{"path":"/fouls","exact":true,"component":"./src/pages/fouls/index.js"},{"path":"/fouls/model","exact":true,"component":"./src/pages/fouls/model.js"},{"path":"/fouls/service","exact":true,"component":"./src/pages/fouls/service.js"},{"path":"/group","exact":true,"component":"./src/pages/group/index.js"},{"path":"/group/model","exact":true,"component":"./src/pages/group/model.js"},{"path":"/group/service","exact":true,"component":"./src/pages/group/service.js"},{"path":"/group/table","exact":true,"component":"./src/pages/group/table.js"},{"path":"/group/word","exact":true,"component":"./src/pages/group/word.js"},{"path":"/contact","exact":true,"component":"./src/pages/contact/index.js"},{"path":"/contact/model","exact":true,"component":"./src/pages/contact/model.js"},{"path":"/contact/service","exact":true,"component":"./src/pages/contact/service.js"},{"path":"/illegalUser/BakModal","exact":true,"component":"./src/pages/illegalUser/BakModal.js"},{"path":"/illegalUser/delBakModal","exact":true,"component":"./src/pages/illegalUser/delBakModal.js"},{"path":"/illegalUser/form","exact":true,"component":"./src/pages/illegalUser/form.js"},{"path":"/illegalUser","exact":true,"component":"./src/pages/illegalUser/index.js"},{"path":"/illegalUser/model","exact":true,"component":"./src/pages/illegalUser/model.js"},{"path":"/illegalUser/service","exact":true,"component":"./src/pages/illegalUser/service.js"},{"path":"/home/service","exact":true,"component":"./src/pages/home/service.js"},{"path":"/keywords/form","exact":true,"component":"./src/pages/keywords/form.js"},{"path":"/keywords","exact":true,"component":"./src/pages/keywords/index.js"},{"path":"/keywords/model","exact":true,"component":"./src/pages/keywords/model.js"},{"path":"/keywords/service","exact":true,"component":"./src/pages/keywords/service.js"},{"path":"/login","exact":true,"component":"./src/pages/login/index.js"},{"path":"/login/model","exact":true,"component":"./src/pages/login/model.js"},{"path":"/dashboard/model","exact":true,"component":"./src/pages/dashboard/model.js"},{"path":"/rooms","exact":true,"component":"./src/pages/rooms/index.js"},{"path":"/rooms/model","exact":true,"component":"./src/pages/rooms/model.js"},{"path":"/rooms/service","exact":true,"component":"./src/pages/rooms/service.js"},{"path":"/chats/BakModal","exact":true,"component":"./src/pages/chats/BakModal.js"},{"path":"/chats","exact":true,"component":"./src/pages/chats/index.js"},{"path":"/chats/model","exact":true,"component":"./src/pages/chats/model.js"},{"path":"/chats/services/chats","exact":true,"component":"./src/pages/chats/services/chats.js"},{"path":"/settings","exact":true,"component":"./src/pages/settings/index.js"},{"path":"/settings/model","exact":true,"component":"./src/pages/settings/model.js"},{"path":"/settings/service","exact":true,"component":"./src/pages/settings/service.js"},{"path":"/chat-model/SearchForm","exact":true,"component":"./src/pages/chat-model/SearchForm.js"},{"path":"/chat-model","exact":true,"component":"./src/pages/chat-model/index.js"},{"path":"/chat-model/model","exact":true,"component":"./src/pages/chat-model/model.js"},{"path":"/chat-model/service","exact":true,"component":"./src/pages/chat-model/service.js"},{"path":"/stat/chats","exact":true,"component":"./src/pages/stat/chats.js"},{"path":"/stat/keyword","exact":true,"component":"./src/pages/stat/keyword.js"},{"path":"/stat/models/chats","exact":true,"component":"./src/pages/stat/models/chats.js"},{"path":"/stat/models/userInfo","exact":true,"component":"./src/pages/stat/models/userInfo.js"},{"path":"/stat/service","exact":true,"component":"./src/pages/stat/service.js"},{"path":"/stat/userinfo","exact":true,"component":"./src/pages/stat/userinfo.js"},{"path":"/account/addUser","exact":true,"component":"./src/pages/account/addUser.js"},{"path":"/account","exact":true,"component":"./src/pages/account/index.js"},{"path":"/account/model","exact":true,"component":"./src/pages/account/model.js"},{"path":"/account/service","exact":true,"component":"./src/pages/account/service.js"},{"path":"/account/userInfo","exact":true,"component":"./src/pages/account/userInfo.js"},{"path":"/stat-admin","exact":true,"component":"./src/pages/stat-admin/index.js"},{"path":"/stat-admin/model","exact":true,"component":"./src/pages/stat-admin/model.js"},{"path":"/stat-admin/service","exact":true,"component":"./src/pages/stat-admin/service.js"},{"path":"/stat-admin/word","exact":true,"component":"./src/pages/stat-admin/word.js"},{"path":"/home","exact":true,"component":"./src/pages/home/index.js"},{"path":"/home/model","exact":true,"component":"./src/pages/home/model.js"},{"path":"/login/service","exact":true,"component":"./src/pages/login/service.js"}]}]' })
      }
    ]
  }
];


export default function() {
  return (
<Router history={window.g_history}>
  <Route render={({ location }) =>
    renderRoutes(routes, {}, { location })
  } />
</Router>
  );
}
