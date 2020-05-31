import React, { Component } from 'react';
import { Card, DatePicker, Select } from 'antd'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import { Page ,Bizcharts} from 'components'
import moment from 'moment';
import styles from '../stat.less'
import {ListRoom} from './service'
const {List, Line} = Bizcharts
const Option = Select.Option

class UserActive extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ...props,
            listRoom:this.props.dashboard.listRoom,
            value: '',
            start: moment().startOf('month').format("YYYY-MM-DD"), 
            end: moment().format("YYYY-MM-DD"),
        }
    }
    componentDidMount(){
        ListRoom().then(res=>{
            this.setState({
                value:res.data[0].id
            })
        })
    }
    disabledDate = current => {
        return current && current > moment().startOf('day');
    }
    handleChange = (value) => {
        this.setState({
            value
        })
        this.props.dispatch({ type: 'dashboard/querysuserLine', payload: { start: this.state.start, end: this.state.end, roomid: value } })
    }
    onChange = (dates, dateStrings) => {
        this.setState({
            start: dateStrings[0],
            end: dateStrings[1]
        })
        this.props.dispatch({ type: 'dashboard/querysuserLine', payload: { start: dateStrings[0], end: dateStrings[1], roomid: this.state.value } })
    }
    render() {
        // const clientHeight = document.body.clientHeight
        const RangePicker = DatePicker.RangePicker
        const listRoom = this.props.dashboard.listRoom
        return (
            <Page>
                <Card className="content-box"
                    title="活跃度"
                    extra={(
                        <div className={styles.SearchContainer}>
                            <Select
                                className={styles['search-item']}
                                value={this.state.value}
                                onChange={((value, option) => this.handleChange(value, option))} >
                                {listRoom.map(it => (
                                <Option key={it.id} >{it.name}</Option>
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
                        <Line data={this.props.dashboard.userActiveList} title={'单位(人)'}/>
                        <List pageList={this.props.dashboard.userActiveList} type={'line'} ></List>
                    </div>
                </Card>
            </Page>
        );
    }
}
UserActive.propTypes = {
    dashboard: PropTypes.object,
}
export default connect(({ dashboard }) => ({ dashboard }))(UserActive)