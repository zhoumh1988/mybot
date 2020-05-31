import React, { Component } from 'react';
import { Card, Table, DatePicker, Select } from 'antd'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import { Page } from 'components'
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts'
import DataSet from '@antv/data-set';
import moment from 'moment';
import { request, config } from 'utils'
import common from 'common'
import styles from '../stat.less'

const { api } = config
const { listRoom } = api
const Option = Select.Option;

const columns = [{
  title: '日期',
  dataIndex: 'date',
  key: 'date',
  width: 200
}, {
  title: '日活',
  dataIndex: '日活',
  key: '日活',
    width: 200
}, {
  title: '周活',
  dataIndex: '周活',
  key: '周活',
    width: 200
}, {
  title: '月活',
  dataIndex: '月活',
  key: '月活',
    width: 200
}];

class Group extends Component {
  constructor(props) {
    super(props)
    this.state = {
        ...props,
        roomValue: "",
        start: moment().subtract(30, 'days').format("YYYY-MM-DD"),
        end: moment().subtract(1, 'days').format("YYYY-MM-DD"),
        roomlist: []
    }
  }

    componentDidMount() {
        this.ajaxData();
    }
    disabledDate = current => {
      return current && current > moment().startOf('day');
  }
    ajaxData() {
        request({
            url: listRoom,
            method: 'get',
        }).then(rs => {
            if (rs.data !== null && Array.isArray(rs.data)) {
            rs
                .data
                this.setState({roomlist: rs.data})
                this.setState({roomValue: rs.data[0].id})
            }
        });
    }
    
    onChange = (dates, dateStrings) => {
        this.setState({start: dateStrings[0], end: dateStrings[1]}, () => {
            this.changeLine();
        })
    }

    handleChangeRoom(value) {
        this.setState({roomValue: value}, () => {
            this.changeLine();
        })
    }

    changeLine(){
        let state = this.state;
        this.props.dispatch({ type: 'group/querys', payload: { start: state.start, end: state.end, roomid: state.roomValue } })
    }
    
    
  render() {
    const ds = new DataSet();
    const dv = ds.createView().source(this.props.group.pageList);
    dv.transform({
      type: 'fold',
      fields: ['日活', '周活', '月活'], // 展开字段集
      key: 'active', // key字段
      value: 'value', // value字段
    });
    const cols = {
      date: {
        range: [0, 1]
      },
      value:{
            alias: '单位(人)'
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
    const clientHeight = document.body.clientHeight
    const RangePicker = DatePicker.RangePicker;
    
    let {defaultValue, roomlist} = this.state;
    defaultValue = common.isNotEmpty(defaultValue)
        ? defaultValue
        : '';

    return (
      <Page>
        <Card className="content-box"
            title="活跃度"
            extra={(
                <div style={{ textAlign:'right' }} className={styles.SearchContainer}>
                    <Select
                        className={styles["search-item"]}
                        name='群组列表'
                        style={{ marginRight:20+'px' }}
                        defaultValue={defaultValue}
                        value={this.state.roomValue}
                        onChange={((value) => this.handleChangeRoom.call(this, value))}>
                        {roomlist.map(it => (
                        <Option key={it.id} value={it.id}>{it.name}</Option>
                        ))}
                    </Select>
                    <RangePicker
                    className={styles["search-item"]}
                    ranges={{ 昨天: [moment().subtract(1, 'day'), moment().subtract(1, 'day')], '当月': [moment().startOf('month'), moment()] }}
                    onChange={this.onChange}
                    defaultValue={[moment().subtract(30, 'days'), moment().subtract(1, 'days')]}
                    allowClear={false}
                    disabledDate={this.disabledDate}
                    />
                </div>
            )}>
          
          <div className={styles.padding}>
              <Chart height={300} data={dv} scale={cols} forceFit padding={[40, 'auto', 50, 'auto']}>
                <Legend  position="top" />
                <Axis name="date" />
                <Axis name="value" label={{ formatter: val => `${val}` }} title={title}/>
                <Tooltip crosshairs={{ type: "y" }} />
                <Geom type="line" position="date*value" size={1} color={['active', '#0553f1-#5ff4c3-#f46363']}/>
                <Geom type='point' position="date*value" size={4} shape={'circle'} color={['active', '#0553f1-#5ff4c3-#f46363']} style={{ stroke: '#fff', lineWidth: 1 }} />
              </Chart>
              <Table 
                    rowKey='date' 
                    hideOnSinglePage='false' 
                    dataSource={this.props.group.pageList} 
                    columns={columns} 
                    size="small" 
                    pagination={false} 
                    scroll={{
                        y: clientHeight - 540
                    }}/>
          </div>
        </Card>
      </Page>
    );
  }
}
Group.propTypes = {
    group: PropTypes.object,
  showModal: PropTypes.func
}
export default connect(({ group }) => ({ group }))(Group)