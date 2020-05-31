import React, { Component } from 'react'
import { Card, DatePicker, Select, Row, Col } from 'antd'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Page, Bizcharts } from 'components'
import moment from 'moment'
import {request} from 'utils'
import styles from '../stat.less'

const {List, Pie} = Bizcharts;
const Option = Select.Option;

class GroupWord extends Component {
    constructor(props) {
        super(props)
        this.state = {
            roomList: [],
            roomid: '',
            start: moment().subtract(30, 'days').format("YYYY-MM-DD"),
            end: moment().subtract(1, 'days').format("YYYY-MM-DD"),
            ...props
        }
    }

    UNSAFE_componentWillMount() {
        request({
            url: '/api/room/listRoom',
            method: 'get',
            data: {}
        }).then(rs => {
            if (rs.data !== null && Array.isArray(rs.data)) {
            rs
                .data
                this.setState({
                    roomList: rs.data,
                    roomid: rs.data[0].id
                })
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
                type: 'group/querysPieList',
                payload: {
                    roomid: roomid,
                    start: start,
                    end: end
                }
            })
        }

    render() {
        // const clientHeight = document.body.clientHeight
        const RangePicker = DatePicker.RangePicker
        const {roomList, roomid} = this.state
        const height = document.querySelector('.ant-layout-content').clientHeight - 248
        
        return (
            <Page>
                <Card className="content-box"
                    title="回复字数"
                    extra={(
                        <div style={{ textAlign: 'right' }} className={styles.SearchContainer} >
                            <Select
                                className={styles["search-item"]}
                                style={{
                                    marginRight: 20
                                }}
                                defaultValue={roomid}
                                value={roomid}
                                onChange={((value) => this.roomidChange.call(this, value))}>
                                {roomList.map(it => (
                                <Option key={it.id} value={it.id}>{it.name}</Option>
                                ))}
                            </Select>
                            <RangePicker
                            className={styles["search-item"]}
                            ranges={{ 昨天: [moment().subtract(1, 'day'), moment().subtract(1, 'day')], '当月': [moment().startOf('month'), moment()] }}
                            onChange={this.onChangeTime}
                            defaultValue={[moment().subtract(30, 'days'), moment().subtract(1, 'days')]}
                            allowClear={false}
                            />
                        </div>
                    )}>
                    <div className={styles.padding}>
                        <Row>
                            <Col span={12}>
                                <Pie data={this.props.group.pie} height={height}></Pie>
                            </Col>
                            <Col span={12}>
                                <List pageList={this.props.group.pieList} type={'pie'} height={height}></List>
                            </Col>
                        </Row>
                    </div>
                </Card>
            </Page>
        )
    }
}
GroupWord.propTypes = {
    group: PropTypes.object,
}
export default connect(({ group }) => ({ group }))(GroupWord)