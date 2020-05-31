import React, {Component} from 'react';
import {
    Card,
    Select,
    DatePicker,
    Table,
    Row,
    Col
} from 'antd'
import {Page} from 'components'
import {Chart, Axis, Geom, Tooltip} from 'bizcharts'
import moment from 'moment';
import styles from '../stat.less'
import {KeywordsList} from '../home/service'
import {ListRoom} from '../dashboard/service'
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
class keyword extends Component {
    constructor() {
        super()
        this.state = {
            list: [],
            listRoom: [],
            value: '',
            defaultValue: '',
            start: moment()
                .subtract(30, 'days')
                .format('YYYY-MM-DD'),
            end: moment()
                .subtract(1, 'days')
                .format('YYYY-MM-DD')
        }
    }
    componentDidMount() {
        ListRoom().then(res => {
            res
                .data
                .unshift({id: '', name: '全部'})
            let obj = {
                start: this.state.start,
                end: this.state.end,
                roomid: res.data[0].id
            }
            KeywordsList(obj).then(result => {
                this.setState({
                    listRoom: res.data,
                    value: res.data[0].id,
                    ...result.data
                })
            })
        })
    }
    handleChange = (value) => {
        this.setState({
            value
        }, () => this.changeData())

    }
    changeData() {
        KeywordsList({start: this.state.start, end: this.state.end, roomid: this.state.value}).then(result => {
            this.setState({
                ...result.data
            })
        })
    }
    onChange = (dates, dateStrings) => {
        this.setState({
            start: dateStrings[0],
            end: dateStrings[1]
        }, () => this.changeData())
    }
    renderCard(rowKey) {
        return (<Table
            rowKey={rowKey}
            hideOnSinglePage='false'
            dataSource={rowKey === 'keyword'
            ? this.state.table
            : this.state.list}
            columns={[
            {
                title: rowKey === 'keyword'
                    ? '关键词'
                    : '日期',
                dataIndex: rowKey,
                key: rowKey,
                width: '50%'
            }, {
                title: '曝光次数',
                dataIndex: 'count',
                key: 'count',
                sorter: (a, b) => a.count - b.count
            }
        ]}
            size="small"
            pagination={false}
            scroll={{
            y: 240
        }}/>)
    }
    render() {
        const RangePicker = DatePicker.RangePicker
        return (
            <Page>
                <Card
                    className="content-box"
                    title="关键词曝光"
                    extra={(
                    <div className={styles.SearchContainer}>
                        <Select
                            className={styles['search-item']}
                            value={this.state.value}
                            onChange={((value, option) => this.handleChange(value, option))}>
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
                            今天: [
                                moment(), moment()
                            ],
                            '当月': [
                                moment().startOf('month'),
                                moment()
                            ]
                        }}
                            onChange={this.onChange}
                            defaultValue={[
                            moment().subtract(30, 'days'),
                            moment().subtract(1, 'days')
                        ]}
                            allowClear={false}/>
                    </div>
                )}>
                    <div className={styles.padding}>
                        <Chart
                            height={300}
                            data={this.state.list}
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
                                itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>曝光次数: {value}</li>'/>
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
                        <Row gutter={32}>
                            <Col span={12} key="date">
                                <Card title="按日期统计">
                                    {this.renderCard("date")}
                                </Card>
                            </Col>
                            <Col span={12} key="keyword">
                                <Card title="按关键词统计">
                                    {this.renderCard("keyword")}
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </Card>
            </Page>
        );
    }
}
export default keyword