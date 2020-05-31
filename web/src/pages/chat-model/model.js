import modelExtend from 'dva-model-extend'
import {model} from 'utils/model'
import {model as chatModel, exportChats} from './service'
import {exportExcel} from 'xlsx-oc'
import moment from 'moment'
import {message} from 'antd'

export default modelExtend(model, {
    namespace: 'chatModel',
    state: {
        loading: true,
        loadingMore: false,
        pageno: 0,
        pagesize: 15,
        pageList: [],
        total: 0,
        chatList: []
    },
    subscriptions: {
        // setup({dispatch, history}) {
        //     history.listen(({pathname}) => {
        //     })
        // }
    },
    effects: {
        * pageList({
            payload
        }, {call, put}) {
            yield put({
                type: 'asyncState',
                payload: {
                    loadingMore: payload.pageno !== 0,
                    loading: payload.pageno === 0,
                    pageList: []
                }
            });
            const data = yield call(chatModel, payload)
            if (data.code === 0) {
                yield put({
                    type: 'asyncState',
                    payload: {
                        loadingMore: false,
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
        asyncState(state, {payload}) {
            return {
                ...state,
                chatList: payload.pageno === 0 ? payload.pageList : state.chatList.concat(payload.pageList),
                ...payload
            }
        }
    }
})
