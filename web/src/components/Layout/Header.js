import React from 'react'
import PropTypes from 'prop-types'
import { Menu, Layout} from 'antd'
import styles from './Header.less'
import Bread from './Bread'
import { Link } from 'react-router-dom'
import html2canvas from 'html2canvas'
import cs from 'classnames'
import Iconfont from '../Iconfont'

const { SubMenu } = Menu
const overflow = styles['overflow-hidden']
// 保存文件函数
var saveFile = function (data, filename) {
  var save_link = document.createElement('a');
  save_link.href = data;
  save_link.download = filename;
  var event = document.createEvent('MouseEvents');
  event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  save_link.dispatchEvent(event);
}
const Header = ({
  user, logout,siderFold, location, menu,
}) => {
  let handleClickMenu = e => e.key === 'logout' && logout()

  const breadProps = {
    menu,
    location,
  }

  const classNames = {};
  classNames[styles.header] = true;
  classNames[styles.collapsed] = siderFold;
  function cameraPng() {
    let dom;
    let content = document.getElementById('page-content');
    // let content = document.getElementsByClassName('ant-layout-content')[0];
    if(location.pathname==="/chat-model"||location.pathname==="/home"||location.pathname==="/account/userInfo") {
      dom = document.getElementsByClassName('png-overflow');
      if(dom){
        for(var i=0;i<dom.length;i++){
          dom[i].classList.add(overflow);
        }
      }
    }else{
      content.classList.add(overflow);
    } 
    // console.log(location.pathname)
    html2canvas(content).then(canvas => {
      if(dom){
        for(var i=0;i<dom.length;i++){
          dom[i].classList.remove(overflow);
        }
      }
      content.classList.remove(overflow);
        var img_data1 = canvas.toDataURL("image/png");
        saveFile(img_data1, '截图');
    });
  }
  
  return (
    <Layout.Header className={cs(classNames)}>
      <Bread {...breadProps} />
      <div className={styles.rightWarpper}>
        <div onClick={cameraPng} className={styles.screenshot}>
          <Iconfont type="screenshot" />
          {"截图"}
        </div>
        <Menu mode="horizontal" onClick={handleClickMenu}>
          <SubMenu
            style={{
              float: 'right',
              lineHeight: '68px'
            }}
            title={<span>
              <Iconfont type="user" style={{fontSize: '24px', marginRight: '8px', verticalAlign: 'middle'}} />
              {user.name}
            </span>}
          >
            <Menu.Item>
              <Link to="/account/userInfo">我的账户</Link>
            </Menu.Item>
            {user.name === 'admin' ? (<Menu.Item>
              <Link to="/settings">全局配置</Link>
            </Menu.Item>) : ''}
            <Menu.Item key="logout">
              退出登录
            </Menu.Item>
          </SubMenu>
        </Menu>
      </div>
    </Layout.Header>
  )
}

Header.propTypes = {
  menu: PropTypes.array,
  user: PropTypes.object,
  logout: PropTypes.func,
  siderFold: PropTypes.bool,
  location: PropTypes.object,
}

export default Header
