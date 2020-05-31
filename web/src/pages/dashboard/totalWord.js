import React, { Component } from 'react';
import { connect } from 'dva'
import PropTypes from 'prop-types'
import { Page,Bizcharts } from 'components'
import { Card,DatePicker, Row, Col} from 'antd'
import moment from 'moment';
import styles from "../stat.less"

const {List, Pie} = Bizcharts
class totalWord extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ...props,
        }
    }
    disabledDate = current => {
        return current && current > moment().startOf('day');
    }
    onChange = (dates, dateStrings) => {
        // console.log('From: ', dates[0], ', to: ', dates[1]);
        // console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
        this.props.dispatch({ type: 'dashboard/querysPie', payload: { start: dateStrings[0], end: dateStrings[1] } })
        this.props.dispatch({ type: 'dashboard/querysPieList', payload: { start: dateStrings[0], end: dateStrings[1] } })
    }
    render() {
        // const clientHeight = document.body.clientHeight
        const RangePicker = DatePicker.RangePicker;
        const height = document.querySelector('.ant-layout-content').clientHeight - 248
        return (
            <Page>
                <Card className="content-box"
                    title="回复字数"
                    extra={(
                        <div className={styles.SearchContainer}>
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
                                <Pie data={this.props.dashboard.pieList} height={height}></Pie>
                            </Col>
                            <Col span={12}>
                                <List pageList={this.props.dashboard.pieListTable} type={'pie'} height={height} ></List>
                            </Col>
                        </Row>
                    </div>
                </Card>
            </Page>
        )
    }
}
totalWord.propTypes = {
    dashboard: PropTypes.object,
}
export default connect(({ dashboard }) => ({ dashboard }))(totalWord)