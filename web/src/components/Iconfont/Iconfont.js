import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import './iconfont.less'

class Iconfont extends Component {
  render() {
    const { type, colorful = false, className } = this.props;
    if (colorful) {
      return (
        <svg className={classnames('colorful-icon', className)} aria-hidden="true">
          <use xlinkHref={`#${type.startsWith('#') ? type.replace(/#/, '') : type}`} />
        </svg>
      )
    }
    
    return <i className={classnames('antlightbot', [`icon-lightbot-${type}`], className)} {...this.props}/>
  }
}

Iconfont.propTypes = {
  type: PropTypes.string.isRequired,
  colorful: PropTypes.bool,
  className: PropTypes.string,
}

export default Iconfont