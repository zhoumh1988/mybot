import React from 'react'
import {connect} from 'dva'
import {Card} from 'antd'
import {Page} from 'components'

class Settings extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            ...props
        }
    }

    render() {
        return (
            <Page>
                <Card bodyStyle={{
                    padding: 0
                }}>
                    哈哈
                </Card>
            </Page>
        )
    }
}

export default connect(({settings}) => ({settings}))(Settings)