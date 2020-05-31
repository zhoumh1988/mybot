import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Popover } from 'antd'
import {config} from 'utils'
import styles from './Layout.less'
import Menus from './Menu'
import classnames from 'classnames'
import Iconfont from '../Iconfont'

const Sider = ({
    siderFold,
    darkTheme,
    location,
    // changeTheme,
    navOpenKeys,
    changeOpenKeys,
    menu,
    isNavbar,
    switchMenuPopover,
    menuPopoverVisible,
    switchSider,

}) => {
    const menusProps = {
        menu,
        siderFold,
        darkTheme,
        location,
        navOpenKeys,
        changeOpenKeys,
        isNavbar,
        handleClickNavMenu: switchMenuPopover,
    }

    const classNames = {};
    classNames[styles.header] = true;
    classNames[styles.collapsed] = siderFold;
    return (
        <div>
            <div className={styles.logo}>
                <img alt="logo" src={siderFold ? config.logoFold : config.logo}/>
            </div>
            <Menus {...menusProps}/>
            {isNavbar
            ? <Popover placement="bottomLeft" onVisibleChange={switchMenuPopover} visible={menuPopoverVisible} overlayClassName={styles.popovermenu} trigger="click" content={<Menus {...menusProps} />}>
            <div className={styles.button}>
                <Icon type="bars" />
            </div>
            </Popover>
            : <div
            className={styles.button}
            onClick={switchSider}>
            <Iconfont type={classnames({ 'arrow-right': siderFold, 'arrow-left': !siderFold })} />
            </div>}
        </div>
    )
}

Sider.propTypes = {
    menu: PropTypes.array,
    siderFold: PropTypes.bool,
    darkTheme: PropTypes.bool,
    location: PropTypes.object,
    // changeTheme: PropTypes.func,
    navOpenKeys: PropTypes.array,
    changeOpenKeys: PropTypes.func
}

export default Sider
