import modelExtend from 'dva-model-extend'
import {model} from 'utils/model'
import {pageList, exportChats} from './services/chats'
import {exportExcel} from 'xlsx-oc'
import moment from 'moment'
import {message} from 'antd'

export default modelExtend(model, {
    namespace: 'chats',
    state: {
        loading: true,
        pageno: 0,
        pagesize: 15,
        pageList: [],
        total: 0
    },
    subscriptions: {
        setup({dispatch, history}) {
            history.listen(({pathname}) => {
                if (pathname === '/chats') {
                    dispatch({
                        type: 'pageList',
                        payload: {
                            pageno: 0,
                            pagesize: 15
                        }
                    })
                }
            })
        }
    },
    effects: {
        * pageList({
            payload
        }, {call, put}) {
            yield put({
                type: 'queryPageList',
                payload: {
                    loading: true,
                    pageList: []
                }
            });
            const data = yield call(pageList, payload)
            if (data.code === 0) {
                yield put({
                    type: 'queryPageList',
                    payload: {
                        loading: false,
                        ...data.data
                    }
                })
            } else {
                throw data
            }
        },
        * export({
            payload
        }, {call}) {
            const res = yield call(exportChats, payload)
            if (res.code === 0) {
                if(res.data.length !== 0) {
                    const header = [
                        { k: 'topic', v: '群组' },
                        { k: 'name', v: '发言人' },
                        { k: 'content', v: '内容' },
                        { k: 'type', v: '类型' },
                        { k: 'created', v: '发言时间' }
                    ];
                    exportExcel(header, res.data, `聊天记录${moment().format('YYYYMMDDHHmmss')}.xlsx`);
                } else {
                    message.warn("未检索到数据，请修改查询参数再试。");
                }
            } else {
                throw res
            }
        }
    },
    reducers: {
        queryPageList(state, {payload}) {
            return {
                ...state,
                ...payload
            }
        }
    }
})
