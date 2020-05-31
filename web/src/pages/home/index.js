import React, { Component } from 'react';
import { Card, Row, Col, Icon, Tooltip as AntdTooltip, Table, Tag, Select } from 'antd'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import { Bizcharts, Page, Iconfont } from 'components'
import { Chart, Axis, Geom, Tooltip, Label } from 'bizcharts'
import styles from '../stat.less'
import homeStyle from './index.less'
import { SmallIndex } from './service'
import {config} from 'utils'


const iconSVG = {
    "yestday-day-active": require('../../svg/iconfont/yestday-day-active.svg'),
    "yestday-week-active": require('../../svg/iconfont/yestday-week-active.svg'),
    "yestday-month-active": require('../../svg/iconfont/yestday-month-active.svg'),
    "contact-total": require('../../svg/iconfont/contact-total.svg'),
    "month-grow": require('../../svg/iconfont/month-grow.svg'),
    "keyword": require('../../svg/iconfont/keyword.svg'),
};

const Option = Select.Option;
// import DataSet from '@antv/data-set';
const { Line } = Bizcharts
const cols = {
    'count': { min: 0 ,alias:'单位(次)',},
    'date': { 
        range: [0, 1],
     }
}
const columns = [
    {
        title: '名称',
        dataIndex: '名称',
        render: (text, record) => {
            return (<div className={record['#']<=3?styles.yelloText:styles.leftText}>{record['#']}.{record['名称']}
            </div>);
        },
        width: '40%',
        align:'left'
    }, {
        title: '成交额(24h)',
        dataIndex: '成交额(24h)',
        align:'left'
    },
    {
        title: '涨幅(24h)',
        dataIndex: '涨幅(24h)',
        width: '22%',
        align:'left'
    }]
let column = [{
    title: '名称',
    dataIndex: '#',
    render: (text, record) => {
        return (<div className={record['#']<=3?styles.yelloText:styles.leftText}>{record['#']}.{record['名称']}
        </div>);
    },
    // width: '75%',
    align:'left'
}, {
    title: '% 1小时',
    dataIndex: '% 1小时',
    width: 95,
    align:'left'
}
]
let price = [
    {
        title: '排名',
        dataIndex: '排名',
        width: '10%',
        align:'left'
    }, {
        title: '交易所',
        dataIndex: '交易所',
        width: '10%',
        align:'left'
    }, {
        title: '交易对',
        dataIndex: '交易对',
        width: '15%',
        align:'left'
    },
    {
        title: '价格',
        dataIndex: '价格',
        width: '15%',
        align:'left'
    }, {
        title: '成交量',
        dataIndex: '成交量',
        width: '15%',
        align:'left'
    }, {
        title: '成交额',
        dataIndex: '成交额',
        width: '15%',
        align:'left'
    }, {
        title: '占比',
        dataIndex: '占比',
        align:'left',
        render: (text, record) => {
            return (<div>
                <div className={styles.outBg}>
                <div className={styles.inner} style={{width:record['占比'].split('%')[0]+'px'}}></div>
                </div>
            {record['占比']}
            </div>);
        },
        width: '20%'
    }
]

class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ...props,
            list: '',
            middle: 'up',
            small: 'hour',
            price: [],
            type:'coin_price_native'
        }
    }
    componentDidMount() {
        SmallIndex().then(res => {
            this.setState({
                ...res.data,
                list: res.data.up_hour.list,
                price: res.data.coin_price_native.list
            })
        })
    }
    onChange1 = (value) => {
        this.setState({
            list: this.state[value + '_' + this.state.small].list,
            middle: value
        })
    }
    Change = (value) => {
        this.setState({
            list: this.state[this.state.middle + '_' + value].list,
            small: value
        })
        let key
        key = value === 'hour' ? '1小时' : value === 'day' ? '24小时' : "1周"
        column[1].dataIndex = '% ' + key
        column[1].title = '% ' + key
    }
    priceChange1=(type)=>{
        this.setState({
            type:type,
            price: this.state[type].list,
        })
    }
    formatter(text, item) {
        // console.log(item)
        // return `<span style={{color:'#fff'}}>${text}</span><br/><span>${item.count}</span>`
        return `<span style="color:#ffffff;display: inline-block;width: 50px;text-align:center">${text}</span></br><span style="color:#ffffff;display: inline-block;width: 50px;text-align:center">${item.point.count}</span>`
    }
    setClassName = (record, index) => {
        return (index % 2 === 0 ? styles.even : styles.odd)
    }
    setX = (first, i) => {
        let s
        s = i === 0 ? first : i % 2 === 0 ? first - (Math.floor(i / 2)) : first + (Math.floor(i / 2)) + 1
        return s
    }
    render() {
        const colsDot = {
            xP: {
                alias: 'x',
                min: 0,
                max: this.props.home.keywordsColumnar.length + 2,
            },
            count: {
                type: 'pow',
                alias: '曝光次数'
            },
            yP: {
                alias: 'y',
                ticks: [1, 2, 3, 4, 5,6,7,8,9]
            },
            item: {
                alias: '关键词'
            }
        }
        const title = {
            autoRotate: true, // 是否需要自动旋转，默认为 true
            // offset: '-10', // 设置标题 title 距离坐标轴线的距离
            textStyle: {
              fontSize: '12',
              textAlign: 'center'
            }, // 坐标轴文本属性配置
            position: 'center', // 标题的位置，**新增**
          }
        const totalObject = this.props.home.data
        const smallIndex = this.state.LightChain ? this.state.LightChain : ''
        let _length = this.props.home.keywordsColumnar.length
        let _first = Math.floor((_length + 2) / 2)
        let vm = this
        this.props.home.keywordsColumnar.forEach(function (item, i) {
            item.xP = vm.setX(_first, i)
            item.yP = Math.ceil(Math.random()*5)+2;
        })
        return (
            <Page className={homeStyle.home}>
                <Card bodyStyle={{
                    padding: 0
                }} style={{ background: '#F5F7F9' }}>
                    <div className={styles.homeRow} >
                        <Row type="flex" justify="space-between">
                            <Col span={4} className={styles.fexItem} style={{ borderRadius: '10px 0 0 10px' }}>
                                <div>
                                    <p>累积用户 
                                        <AntdTooltip title="当前系统抓取到的全部微信用户数量" >
                                            <Icon type="question-circle-o" style={{marginLeft:'3px'}}/>
                                        </AntdTooltip>
                                    </p>
                                    <p className={styles.numLarge}><span>{totalObject.total}</span></p>
                                </div>
                                <div>
                                    <Iconfont type={iconSVG['contact-total'].default.id} colorful />
                                </div>
                            </Col>
                            <Col span={4} className={styles.fexItem}>
                                <div>
                                    <p>月新增
                                        <AntdTooltip title="当天往前推30天，所有的新增用户数量">
                                            <Icon type="question-circle-o"style={{marginLeft:'3px'}} />
                                        </AntdTooltip>
                                    </p>
                                    <p>{totalObject['inc']}</p>
                                </div>
                                <div>
                                    <Iconfont type={iconSVG['month-grow'].default.id} colorful />
                                </div>

                            </Col>
                            <Col span={4} className={styles.fexItem}>
                                <div>
                                    <p>关键词曝光次数
                                        <AntdTooltip title="所有关键词曝光的总数量">
                                            <Icon type="question-circle-o" style={{marginLeft:'3px'}}/>
                                        </AntdTooltip></p>
                                    <p>{totalObject['keywords']}</p>
                                </div>
                                <div>
                                    <Iconfont type={iconSVG['keyword'].default.id} colorful />
                                </div>

                            </Col>
                            <Col span={4} className={styles.fexItem}>
                                <div>
                                    <p>昨日日活<AntdTooltip title="昨日发言的总用户数量">
                                        <Icon type="question-circle-o" style={{marginLeft:'3px'}}/>
                                    </AntdTooltip></p>
                                    <p>{totalObject['1']}</p>
                                </div>
                                <div>
                                    <Iconfont type={iconSVG['yestday-day-active'].default.id} colorful />
                                </div>

                            </Col>
                            <Col span={4} className={styles.fexItem}>
                                <div>
                                    <p>昨日周活<AntdTooltip title="昨日往前推1周所有发言的用户总数量">
                                        <Icon type="question-circle-o" style={{marginLeft:'3px'}}/>
                                    </AntdTooltip></p>
                                    <p>{totalObject['7']}</p>
                                </div>
                                <div>
                                    <Iconfont type={iconSVG['yestday-week-active'].default.id} colorful />
                                </div>

                            </Col>
                            <Col span={4} className={styles.fexItem} style={{ borderRadius: '0 10px 10px 0' }}>
                                <div>
                                    <p>昨日月活<AntdTooltip title="昨日往前推30天所有发言的用户总数量">
                                        <Icon type="question-circle-o" style={{marginLeft:'3px'}}/>
                                    </AntdTooltip></p>
                                    <p>{totalObject['30']}</p>
                                </div>
                                <div>
                                    <Iconfont type={iconSVG['yestday-month-active'].default.id} colorful />
                                </div>

                            </Col>
                        </Row>
                    </div>
                    {this.state.list && smallIndex.cell.length > 0 && <div className={styles.homeRow}>
                        <Row type="flex" justify="space-between">
                            <Col span={6} className={styles.smallItem} style={{ borderRadius: '10px 0 0 10px' }}>
                                <p className={`${styles.smallTile} ${styles.inlineFlex}`}><span><img alt="png" src={config.lightCon} style={{width:'20px',borderRadius:'5px',marginRight:'3px'}} />{smallIndex.tit}</span><span>{this.state.timestamp}</span></p>
                                <div className={styles.itemP}>
                                    <span>{smallIndex.cell[0].coinprice}</span>
                                    <Tag color={smallIndex.cell[0].trend.split('%')[0]>0?'green':'red'} style={{marginRight:'0'}}>{smallIndex.cell[0].trend}</Tag>
                                </div>
                                <p>{smallIndex.cell[0].coinprice_usd}</p>
                                <p>{smallIndex.cell[0].coinprice_btc}</p>
                            </Col>
                            <Col span={6} className={styles.smallItem}>
                                <p className={styles.smallTile}>流通市值</p>
                                <p>{smallIndex.cell[1]['流通市值'].rmb}</p>
                                <p>{smallIndex.cell[1]['流通市值'].usd}</p>
                                <p>{smallIndex.cell[1]['流通市值'].btc}</p>
                            </Col>
                            <Col span={6} className={styles.smallItem}>
                                <p className={styles.smallTile}>流通量</p>
                                <p>{smallIndex.cell[2]['流通量']}</p>
                                <p className={styles.smallTile} style={{margin:'0.5rem 0'}}>总发行量</p>
                                <p>{smallIndex.cell[2]['总发行量']}</p>
                            </Col>
                            <Col span={6} className={styles.smallItem} style={{ borderRadius: '0 10px 10px 0' }}>
                                <p className={styles.smallTile}>24H成交额</p>
                                <p>{smallIndex.cell[3]['24H成交额'].rmb}</p>
                                <div className={styles.itemP}>
                                    <span>{smallIndex.cell[3]['24H成交额'].usd}</span>
                                    <Tag color="cyan" style={{marginRight:'0'}}>{smallIndex.rank}</Tag>
                                </div>
                                <p>{smallIndex.cell[3]['24H成交额'].btc}</p>
                            </Col>
                        </Row>
                    </div>}
                    <div style={{ width: '60%', display: 'inline-block' }} >
                        <div className={styles.homeItem} style={{ marginTop: '0px' }}>
                            <p >总体活跃(30天)</p>
                            <Line data={this.props.home.pageList} height={300} title={'单位(人)'}/>
                        </div>
                        <div className={styles.homeItem}>
                            <p >关键词曝光次数(30天)</p>
                            <Chart height={300} data={this.props.home.keyword.list} scale={cols} forceFit padding={[40, 'auto', 60, 'auto']}>
                                <Axis name="date" />
                                <Axis name="count" title={title}/>
                                <Tooltip crosshairs={{ type: "y" }}
                                    showTitle={true}
                                    itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>曝光次数: {value}</li>' />
                                <Geom type="line" position="date*count" size={2} />
                                <Geom type='point' position="date*count" size={4} shape={'circle'} style={{ stroke: '#fff', lineWidth: 1 }} />
                            </Chart>
                        </div>

                    </div>
                    {this.state.list && <div className={styles.rightItem} >
                        <div className={`${styles.homeItem} ${styles.blueBg} png-overflow`} style={{ marginTop: '0px' }} >
                            <p style={{ marginBottom: '0', border: 'none' }}>Top100</p>
                            <Table columns={columns} dataSource={this.state.top100.list} rowKey="#"
                                size="middle" scroll={{ y: 288 }} pagination={false} rowClassName={this.setClassName}/>
                        </div>
                        <div className={`${styles.homeItem} ${styles.redBg} png-overflow`} >
                            <div className={styles.flexItem} style={{marginBottom:'0'}}>
                                <div className={styles.priceTab}>
                                    <span className={this.state.middle==='up'?styles.active:''} onClick={e=>this.onChange1('up',e)}>涨幅排行榜</span>
                                    <span className={this.state.middle==='down'?styles.active:''} onClick={e=>this.onChange1('down',e)}>跌幅排行榜</span>
                                </div>
                                <Select defaultValue="hour" style={{ width: 100,border:'none' }} onChange={this.Change} className={styles.noBorder}>
                                    <Option value="hour">1小时</Option>
                                    <Option value="day">24小时</Option>
                                    <Option value="week">1周</Option>
                                </Select>
                            </div>
                            <Table columns={column} dataSource={this.state.list} rowKey="#"
                                size="middle" scroll={{ y: 283 }} pagination={false} rowClassName={this.setClassName} />
                        </div>
                    </div>}
                    <div className={styles.homeItem}>
                        <p >关键词总体统计</p>
                        <Chart height={300} data={this.props.home.keywordsColumnar} scale={colsDot} forceFit padding={['auto',10]}>
                            <Tooltip showTitle={false} />
                            <Axis name='xP' visible={false} />
                            <Axis name='yP' visible={false} />
                            {/* <Legend reversed /> visible={false}*/}
                            <Geom type='point' position="xP*yP" color={'item'} offsetY={'10'} offsetX={'20'}
                                tooltip='item*count' opacity={1} shape="circle" size={['count', [30, 50]]} style={['continent', {
                                    // lineWidth: 1,
                                    strokeOpacity: 1,
                                    fillOpacity: 0.3,
                                    opacity: 0.65,
                                    stroke: '#fff'
                                }]} >
                                <Label
                                    content="item"
                                    custom={true}
                                    renderer={this.formatter}
                                    offset={0}
                                />
                            </Geom>
                        </Chart>
                    </div>
                    <div className={`${styles.homeItem} ${styles.tableBorder}`} style={{ marginBottom: '20px' }}>
                    <div className={styles.flex}>
                    <p>LIGHT市场行情</p>
                    <div className={styles.tabChange}>
                        <span  className={this.state.type==='coin_price_native'?styles.active:''} onClick={(e)=>this.priceChange1('coin_price_native',e)}>平台价格 {this.state.type==='coin_price_native'&&<span className={styles.bBorder}></span>}</span>
                        <span className={this.state.type==='coin_price_CNY'?styles.active:''} onClick={(e)=>this.priceChange1('coin_price_CNY',e)}>人民币(CNY){this.state.type==='coin_price_CNY'&&<span className={styles.bBorder}></span>}</span>
                        <span className={this.state.type==='coin_price_USD'?styles.active:''} onClick={(e)=>this.priceChange1('coin_price_USD',e)}>美元(USD){this.state.type==='coin_price_USD'&&<span className={styles.bBorder}></span>}</span>
                        <span className={this.state.type==='coin_price_BTC'?styles.active:''} onClick={(e)=>this.priceChange1('coin_price_BTC',e)}>比特币(BTC){this.state.type==='coin_price_BTC'&&<span className={styles.bBorder}></span>}</span>
                    </div>
                    </div>
                        <Table columns={price} dataSource={this.state.price} rowKey="排名" size="middle" pagination={false} />
                    </div>
                </Card>

            </Page>
        );
    }
}
Home.propTypes = {
    home: PropTypes.object,
}
export default connect(({ home }) => ({ home }))(Home)