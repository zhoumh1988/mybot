import React, { Component } from 'react';
import { Table} from 'antd'

const columns = [{
    title: '日期',
    dataIndex: 'date',
    key: 'date',
  }, {
    title: '日活',
    dataIndex: 'day',
    key: 'day',
  }, {
    title: '周活',
    dataIndex: 'week',
    key: 'week',
  }, {
    title: '月活',
    dataIndex: 'month',
    key: 'month',
  }];
class Tables extends Component {
    constructor(props) {
      super(props)
      this.state = {
        ...props,
        columns:columns
      }
    }
    render (){
        return(
          <Table rowKey='date'  dataSource={this.props.pageList} columns={this.state.columns} size="small" pagination={false} />
        )
    }
}
export default Tables