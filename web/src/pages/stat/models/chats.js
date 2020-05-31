import modelExtend from 'dva-model-extend'
import { model } from 'utils/model'
import { ChatsLine } from '../service'
import moment from 'moment';

const start = moment().subtract(1, 'days').format("YYYY-MM-DD")
const end = moment().subtract(1, 'days').format("YYYY-MM-DD")

export default modelExtend(model, {
    namespace: 'chatsState',
    state: {
        list: [],
        listRoom: [],
        value:'',
        params: {
            start: start,
            end: end,
            timeType: 2,
            roomid: ''
        }
    },
    subscriptions: {
        setup({ dispatch, history }) {
            history.listen(({ pathname }) => {
                switch (pathname) {
                    case "/stat/chats" :
                        dispatch({
                            type: 'line',
                            payload: {
                                start: start,
                                end: end,
                                timeType: 2
                            }
                        })
                    break;
                default:
                    break;
                }
            })
        },
    },
    effects: {
        * line({
            payload,
        }, { call, put }) {
            const data = yield call(ChatsLine, payload)
            if (data.code === 0) {
                yield put({
                    type: 'updateState',
                    payload: {
                        list: data.data
                    }
                })
            } else {
                throw data
            }
        },
    },
    reducers: {
    },
})
