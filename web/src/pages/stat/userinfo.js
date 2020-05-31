import React, {Component} from 'react'
import {
    Card,
    Table,
    DatePicker,
    Select,
    Row,
    Col,
    Progress
} from 'antd'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Page, Bizcharts} from 'components'
import moment from 'moment'
import common from 'common';
import {request} from 'utils'
import styles from '../stat.less'

const {Pie} = Bizcharts;
const Option = Select.Option;
const colors = ['#1890FF', '#13C2C2', '#2FC25B'];

class UserInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            roomList: [],
            roomid: '',
            start: moment()
                .subtract(30, 'days')
                .format("YYYY-MM-DD"),
            end: moment()
                .subtract(1, 'days')
                .format("YYYY-MM-DD"),
            ...props
        }
    }

    componentDidMount() {
        request({url: '/api/room/listRoom', method: 'get', data: {}}).then(rs => {
            if (rs.data !== null && Array.isArray(rs.data)) {
                rs
                    .data
                    .unshift({id: '', name: '全部'})
                this.setState({roomList: rs.data})
            }
        });
    }

    onChangeTime = (dates, dateStrings) => {
        this.setState({
            start: dateStrings[0],
            end: dateStrings[1]
        }, () => {
            this.fetch();
        })
    }

    roomidChange(value) {
        this.setState({
            roomid: value
        }, () => {
            this.fetch();
        })
    }

    fetch() {
        let {roomid, start, end} = this.state
        this
            .props
            .dispatch({
                type: 'userInfo/userInfoPie',
                payload: {
                    roomid: roomid,
                    start: start,
                    end: end
                }
            })
    }

    render() {
        const RangePicker = DatePicker.RangePicker
        const {roomList, roomid} = this.state
        const height = common.getScrollHeight();

        const {userInfoPie} = this.props.userInfo;

        let total = userInfoPie.reduce((total, it) => total + it.count, 0);

        const columns = [
            {
                title: '性别',
                dataIndex: 'item',
                width: 100
            }, {
                title: '人数',
                dataIndex: 'count',
                width: 100
            }, {
                title: '占比',
                dataIndex: 'operate',
                render: (text, record, idx) => <Progress
                        strokeColor={colors[idx]}
                        style={{
                        width: '90%'
                    }}
                        percent={Number(parseFloat(record.count / total * 100).toFixed(2))}/>
            }
        ];

        return (
            <Page>
                <Card
                    className="content-box"
                    title="用户画像"
                    extra={(
                    <div
                        style={{
                        textAlign: 'right'
                    }}
                        className={styles.SearchContainer}>
                        <Select
                            className={styles["search-item"]}
                            defaultValue={roomid}
                            value={roomid}
                            onChange={((value) => this.roomidChange.call(this, value))}>
                            {roomList.map(it => (
                                <Option key={it.id} value={it.id}>{it.name}</Option>
                            ))}
                        </Select>
                        <RangePicker
                            className={styles["search-item"]}
                            ranges={{
                            今天: [
                                moment(), moment()
                            ],
                            '当月': [
                                moment().startOf('month'),
                                moment()
                            ]
                        }}
                            onChange={this.onChangeTime}
                            defaultValue={[
                            moment().subtract(30, 'days'),
                            moment().subtract(1, 'days')
                        ]}
                            allowClear={false}/>
                    </div>
                )}>
                    <div style={{
                        padding: 15
                    }}>
                        <Row type="flex" justify="space-around" align="middle">
                            <Col span={12}>
                                <Pie data={userInfoPie} height={height}></Pie>
                            </Col>
                            <Col span={11}>
                                <div style={{height: 170}}>
                                    <Table
                                        rowKey='item'
                                        hideOnSinglePage='false'
                                        dataSource={userInfoPie}
                                        columns={columns}
                                        pagination={false}/>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Card>
            </Page>
        )
    }
}
UserInfo.propTypes = {
    userInfo: PropTypes.object
}
export default connect(({userInfo}) => ({userInfo}))(UserInfo)