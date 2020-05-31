import React, { Component } from 'react';
import { Card, DatePicker} from 'antd'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import { Page,Bizcharts} from 'components'
// import List from './components/table'
// import Line from './components/line'
import moment from 'moment'
import styles from '../stat.less'

const {List, Line} = Bizcharts
class Dashboard extends Component {
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
    this.props.dispatch({ type: 'dashboard/querysTotal', payload: { start: dateStrings[0], end: dateStrings[1] } })
  }
  render () {
    // const clientHeight = document.body.clientHeight
    const RangePicker = DatePicker.RangePicker
    return (
      <Page>
        <Card className="content-box"
            title="活跃度"
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
            <Line data={this.props.dashboard.pageList} title={'单位(人)'}/>
            <List pageList={this.props.dashboard.pageList} type={'line'} ></List>
          </div>
        </Card>
      </Page>
    );
  }
}
Dashboard.propTypes = {
  dashboard: PropTypes.object,
}
export default connect(({ dashboard }) => ({ dashboard }))(Dashboard)