import React, { Component } from 'react';
import { connect } from 'dva'
import PropTypes from 'prop-types'
import { Page ,Bizcharts} from 'components'
import moment from 'moment'
import { Card,DatePicker,Select, Row, Col} from 'antd'
import styles from "../stat.less"
import {ListRoom} from './service'


const {List, Pie} = Bizcharts
const Option = Select.Option;

class userWord extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ...props,
            value: '',
            defaultValue:'',
            listRoom:this.props.dashboard.listRoom,
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
        this.props.dispatch({ type: 'dashboard/userWordPieList', payload: { start: this.state.start, end: this.state.end, roomid: value } })
    }
    onChange = (dates, dateStrings) => {
        this.setState({
            start: dateStrings[0],
            end: dateStrings[1]
        })
        this.props.dispatch({ type: 'dashboard/userWordPieList', payload: { start: dateStrings[0], end: dateStrings[1],roomid: this.state.value } })
    }
    render() {
        // const clientHeight = document.body.clientHeight
        const RangePicker = DatePicker.RangePicker;
        const listRoom = this.props.dashboard.listRoom
        const height = document.querySelector('.ant-layout-content').clientHeight - 248
        // const defaultValue=listRoom[0]?listRoom[0].id:''
        return (
            <Page>
                <Card className="content-box"
                    title="回复字数"
                    extra={(
                        <div className={styles.SearchContainer}>
                            <Select className={styles["search-item"]}
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
                        <Row>
                            <Col span={12}>
                                <Pie data={this.props.dashboard.userPie} height={height}></Pie>
                            </Col>
                            <Col span={12}>
                                <List pageList={this.props.dashboard.userPieList} type={'pie'} height={height}></List>
                            </Col>
                        </Row>
                    </div>
                </Card>
            </Page>
        )
    }
}
userWord.propTypes = {
    dashboard: PropTypes.object,
}
export default connect(({ dashboard }) => ({ dashboard }))(userWord)