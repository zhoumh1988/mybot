import React, {Component} from 'react'
import styles from './index.less'
import classnames from 'classnames'
import empty from './empty.png'

class Empty extends Component {
    render() {
        const {...props} = this.props;
        props.className = classnames(styles.empty, props.className);
        return (
            <div {...props}><img src={empty} /></div>
        )
    }
}

export default Empty;