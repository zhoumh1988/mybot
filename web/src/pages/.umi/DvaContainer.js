import { Component } from 'react';
import dva from 'dva';
import createLoading from 'dva-loading';

let app = dva({
  history: window.g_history,
  
});

window.g_app = app;
app.use(createLoading());
app.use(require('../../plugins/onError.js').default);
app.model({ namespace: 'app', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/models/app.js').default) });
app.model({ namespace: 'model', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/pages/dashboard/model.js').default) });
app.model({ namespace: 'model', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/pages/fouls/model.js').default) });
app.model({ namespace: 'model', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/pages/group/model.js').default) });
app.model({ namespace: 'model', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/pages/contact/model.js').default) });
app.model({ namespace: 'model', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/pages/illegalUser/model.js').default) });
app.model({ namespace: 'model', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/pages/keywords/model.js').default) });
app.model({ namespace: 'model', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/pages/login/model.js').default) });
app.model({ namespace: 'model', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/pages/rooms/model.js').default) });
app.model({ namespace: 'model', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/pages/chats/model.js').default) });
app.model({ namespace: 'model', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/pages/settings/model.js').default) });
app.model({ namespace: 'model', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/pages/chat-model/model.js').default) });
app.model({ namespace: 'chats', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/pages/stat/models/chats.js').default) });
app.model({ namespace: 'userInfo', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/pages/stat/models/userInfo.js').default) });
app.model({ namespace: 'model', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/pages/account/model.js').default) });
app.model({ namespace: 'model', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/pages/stat-admin/model.js').default) });
app.model({ namespace: 'model', ...(require('/Users/zhouminghua/Documents/projects/lightbot-stat/web/src/pages/home/model.js').default) });

class DvaContainer extends Component {
  render() {
    app.router(() => this.props.children);
    return app.start()();
  }
}

export default DvaContainer;
