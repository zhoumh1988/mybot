import React, {Component} from 'react';
import {Table} from 'antd'
import styles from '../../pages/stat.less'

const columns = [
    {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        width: '25%'
    }, {
        title: '日活',
        dataIndex: '日活',
        key: '日活',
        width: '25%'
    }, {
        title: '周活',
        dataIndex: '周活',
        key: '周活',
        width: '25%'
    }, {
        title: '月活',
        dataIndex: '月活',
        key: '月活'
    }
];
const columnPie = [
    {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        width: '28%'
    }, {
        title: '1-5字',
        dataIndex: '1-5字',
        key: '1-5字',
        width: '17%'
    }, {
        title: '5-10字',
        dataIndex: '5-10字',
        key: '5-10字',
        width: '18%'
    }, {
        title: '10-20字',
        dataIndex: '10-20字',
        key: '10-20字',
        width: '20%'
    }, {
        title: '20字以上',
        dataIndex: '20字以上',
        key: '20字以上'
    }
];
class List extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ...props,
            columns: this.props.type === 'pie'
                ? columnPie
                : columns
        }
    }
    render() {
        const _height = this.props.height
            ? this.props.height
            : (document.querySelector('.ant-layout-content').clientHeight - 248) / 3
        return (
                <Table  className={styles.radius}
                    rowKey='date'
                    dataSource={this.props.pageList}
                    columns={this.state.columns}
                    size="small"
                    pagination={false}
                    scroll={{
                    y: _height
                }}/>
        )
    }
}
export default List