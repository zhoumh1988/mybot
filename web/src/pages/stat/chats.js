import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Card, Select, DatePicker, Table} from 'antd'
import {Page} from 'components'
import {Chart, Axis, Geom, Tooltip} from 'bizcharts'
import moment from 'moment';
import common from 'common';
import {ListRoom} from '../dashboard/service'
import styles from '../stat.less'

const RangePicker = DatePicker.RangePicker
const Option = Select.Option;
const cols = {
    'count': {
        min: 0,
        alias: '单位(次)'
    },
    'date': {
        range: [0, 1]
    }
}
const columns = [
    {
        title: '时间',
        dataIndex: 'date',
        key: 'date',
        width: '50%'
    }, {
        title: '发言次数',
        dataIndex: 'count',
        key: 'count'
    }
];

const title = {
    autoRotate: {
        Boolean
    }, // 是否需要自动旋转，默认为 true
    // offset: 10, // 设置标题 title 距离坐标轴线的距离
    textStyle: {
        fontSize: '12',
        //   textAlign: 'center',
        fill: '#657180',
        //   rotate: '0'
    }, // 坐标轴文本属性配置
    position: 'center', // 标题的位置，**新增**
}

class Chats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...props.chatsState
        }
    }
    
    componentDidMount() {
        ListRoom().then(res => {
            res
                .data
                .unshift({id: '', name: '全部'})
            this.setState({listRoom: res.data});
        });
    }
    handleChange = (value, key) => {
        const {params} = this.state;
        params[key] = value;
        this.setState({params}, () => this.changeData())
    }
    changeData() {
        this
            .props
            .dispatch({
                type: 'chatsState/line',
                payload: {
                    ...this.state.params
                }
            })
    }
    onChange = (dates, dateStrings) => {
        const {params} = this.state;
        params.start = dateStrings[0];
        params.end = dateStrings[1];
        this.setState({params}, () => this.changeData())
    }
    render() {
        const {params} = this.state;
        const scrollHeight = common.getScrollHeight();
        return (
            <Page>
                <Card
                    className="content-box"
                    title="发言统计"
                    extra={(
                    <div className={styles.SearchContainer}>
                        <Select
                            className={styles['search-item']}
                            onChange={((value) => this.handleChange(value, 'timeType'))}
                            value={params.timeType}>
                            <Option value={2}>按小时</Option>
                            <Option value={1}>按日</Option>
                        </Select>
                        <Select
                            className={styles['search-item']}
                            value={params.roomid}
                            onChange={((value) => this.handleChange(value, 'roomid'))}>
                            {this
                                .state
                                .listRoom
                                .map(it => (
                                    <Option key={it.id} value={it.id}>{it.name}</Option>
                                ))}
                        </Select>
                        <RangePicker
                            className={styles["search-item"]}
                            ranges={{
                                '今天': [
                                    moment(), moment()
                                ],
                                "昨天": [
                                    moment().subtract(1, 'day'), moment().subtract(1, 'day')
                                ],
                                '1周': [
                                    moment().subtract(7, 'days'), moment().subtract(1, 'day')
                                ],
                                '1个月': [
                                    moment().subtract(30, 'days'),
                                    moment().subtract(1, 'day')
                                ]
                            }}
                            onChange={this.onChange}
                            defaultValue={[
                            moment(params.start),
                            moment(params.end)
                        ]}
                            allowClear={false}/>
                    </div>
                )}>
                    <div className={styles.padding}>
                        <Chart
                            height={300}
                            data={this.props.chatsState.list}
                            scale={cols}
                            forceFit
                            padding={[40, 'auto', 60, 'auto']}>
                            <Axis name="date"/>
                            <Axis name="count" title={title}/>
                            <Tooltip
                                crosshairs={{
                                type: "y"
                            }}
                                showTitle={true}
                                itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>发言次数: {value}</li>'/>
                            <Geom type="line" position="date*count" size={2}/>
                            <Geom
                                type='point'
                                position="date*count"
                                size={4}
                                shape={'circle'}
                                style={{
                                stroke: '#fff',
                                lineWidth: 1
                            }}/>
                        </Chart>
                        <Table
                            rowKey='date'
                            hideOnSinglePage='false'
                            dataSource={this.props.chatsState.list}
                            columns={columns}
                            size="small"
                            pagination={false}
                            scroll={{
                            y: scrollHeight - 300
                        }}/>
                    </div>
                </Card>
            </Page>
        );
    }
}

Chats.propTypes = {
    chatsState: PropTypes.object
}

export default connect(({chatsState}) => ({chatsState}))(Chats)