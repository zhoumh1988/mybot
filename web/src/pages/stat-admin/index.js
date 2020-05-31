import React, {Component} from 'react'
import {connect} from 'dva'
import { Card, DatePicker} from 'antd'
import {Page, Bizcharts} from 'components'
import moment from 'moment'
import styles from '../stat.less'

const {List, Line} = Bizcharts;
const RangePicker = DatePicker.RangePicker;

class StatAdmin extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ...props
        }
    }

    onChange = (dates, dateStrings) => {
        this
            .props
            .dispatch({
                type: 'statAdmin/query',
                payload: {
                    daterange: dateStrings
                }
            })
    }

    disabledDate = current => {
        return current && current > moment().startOf('day');
    }

    render() {
        const {statAdmin: {active: {data}}} = this.props;
        // const clientHeight = document.body.clientHeight
        const {ranges} = this.state.statAdmin;

        return (
            <Page>
                <Card className="content-box"
                    title="活跃度"
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
                        <Line data={data} title={'单位(人)'}/>
                        <List pageList={data} type={'line'} ></List>
                    </div>
                </Card>
            </Page>
        )
    }
}

export default connect(({statAdmin, loading}) => ({statAdmin, loading}))(StatAdmin);