import modelExtend from 'dva-model-extend'
import { model } from 'utils/model'
import { UserInfoPie } from '../service'
import moment from 'moment';

const start = moment().subtract(30, 'days').format("YYYY-MM-DD")
const end = moment().subtract(1, 'days').format("YYYY-MM-DD")

export default modelExtend(model, {
    namespace: 'userInfo',
    state: {
        userInfoPie: [],
        userInfoLine: []
    },
    subscriptions: {
        setup({ dispatch, history }) {
            history.listen(({ pathname }) => {
                switch (pathname) {
                case "/stat/userinfo" :
                    dispatch({
                        type: 'userInfoPie',
                        payload: {
                            start: start,
                            end: end
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
        * userInfoPie({
            payload,
        }, { call, put }) {
            const data = yield call(UserInfoPie, payload)
            if (data.code === 0) {
                yield put({
                    type: 'SuccesUserInfoPie',
                    payload: {
                        pending: true,
                        ...data
                    }
                })
            } else {
                throw data
            }
        },
    },
    reducers: {
        SuccesUserInfoPie(state, {payload}){
            return {
                ...state,
                userInfoPie: payload.data,
                ...payload,
            }
        },
    },
})
