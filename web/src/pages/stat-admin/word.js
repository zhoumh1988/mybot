import React, { Component } from 'react'
import { connect } from 'dva'
import { Card, DatePicker, Row, Col } from 'antd'
import { Page, Bizcharts } from 'components'
import moment from 'moment'
import styles from '../stat.less'

const { List, Pie } = Bizcharts

class StatAdminWord extends Component {
    constructor(props) {
        super()
        this.state = {
            ...props
        }
    }

    onChange = (dates, dateStrings) => {
        this
            .props
            .dispatch({
                type: 'statAdmin/queryWord',
                payload: {
                    daterange: dateStrings
                }
            })
    }

    disabledDate = current => {
        return current && current > moment().startOf('day');
    }

    render() {
        const { statAdmin: { word: { data, list } } } = this.props
        // const clientHeight = document.body.clientHeight
        const {ranges} = this.state.statAdmin;
        const RangePicker = DatePicker.RangePicker
        
        const height = document.querySelector('.ant-layout-content').clientHeight - 248
        return (
            <Page>
                <Card className="content-box"
                    title="回复字数"
                    extra={(
                        <div className={styles.SearchContainer}>
                            <RangePicker
                                className={styles["search-item"]}
                                ranges={ranges}
                                onChange={this.onChange}
                                defaultValue={ranges['1个月']}
                                disabledDate={this.disabledDate}
                                allowClear={false}/>
                        </div>
                    )}>
                    <div className={styles.padding}>
                        <Row>
                            <Col span={12}>
                                <Pie data={data} height={height} />
                            </Col>
                            <Col span={12}>
                                <List pageList={list} type='pie' height={height} />
                            </Col>
                        </Row>
                    </div>
                </Card>
            </Page>
        )
    }
}

export default connect(({ statAdmin, loading }) => ({ statAdmin, loading }))(StatAdminWord);