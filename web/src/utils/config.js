const APIV1 = '/api'

module.exports = {
  name: 'Lightbot统计分析管理平台',
  shotName: 'Lightbot',
  prefix: 'LIGHTBOT',
  footerText: 'Lightbot  © 2018',
  logo: '/public/logo.svg',
  logoFold: '/public/logo-fold.svg',
  logoIcon: '/public/logo-icon.png',
  lightCon: '/public/lightCon.png',
  iconFontCSS: '/public/iconfont.css',
  iconFontJS: '/public/iconfont.js',
  CORS: [],
  openPages: ['/login'],
  APIV1,
  api: {
    userLogin: `${APIV1}/login`,//登录
    userLogout: `${APIV1}/logout`,//退出登录
    userInfo: `${APIV1}/userInfo`,//用户信息
    // 系统
    accountList: `${APIV1}/account/page`,//系统用户列表
    resetPwd: `${APIV1}/account/reset/pwd/:id`,//重置密码
    deleteUser: `${APIV1}/account/delete/:id`,//注销账户
    createUser: `${APIV1}/account/create`,//创建账户
    modifyMobile: `${APIV1}/account/modify/mobile`,//修改手机号
    modifyEmail: `${APIV1}/account/modify/email`,//修改邮箱
    modifyPwd: `${APIV1}/account/modify/pwd`,//修改密码
    // 群组
    roomPage: `${APIV1}/room/page`,//群组列表
    getList: `${APIV1}/account/list`,//获取用户列表
    contactList: `${APIV1}/contact/list`,//某群的所有人
    userList: `${APIV1}/account/list`,//用户列表
    roomManage: `${APIV1}/room/manager`,//更新群管理员
    roomOwer: `${APIV1}/room/owner`,//更新群责任账户
    pushMessage: `${APIV1}/room/report`,//群组消息推送
    
    //用户
    contactPage: `${APIV1}/contact/page`,//用户列表
    listRoom: `${APIV1}/room/listRoom`,//群列表
    setRole: `${APIV1}/contact/setRole`,//设置角色
    itemUnique:`${APIV1}/account/unique/:prop`,
    modifyStatus: `${APIV1}/account/modify/status`,
    // 统计
    statTotal: `${APIV1}/stat/totalactive/list`,//总体统计
    adminActive: `${APIV1}/stat/adminactive/list`,//管理员统计
    userActive: `${APIV1}/stat/useractive/list`,//用户统计
    roomActive: `${APIV1}/stat/roomactive/list`,//群统计
    //饼图-回复字数
    adminPie: `${APIV1}/stat/adminword/pie`,//管理员统计
    totalPie: `${APIV1}/stat/totalword/pie`,//总体统计
    totalPieList: `${APIV1}/stat/totalword/list`,//总体统计表格
    userPieList: `${APIV1}/stat/userword/list`,//用户表格
    userPie: `${APIV1}/stat/userword/pie`,//用户表格

    //home
    homeStat: `${APIV1}/home/stat`,//用户表格
    roomPie: `${APIV1}/stat/userword/list`,//群统计
    keywordsList: `${APIV1}/stat/keywords/line`,//关键词曝光次数
    keywordsColumnar: `${APIV1}/stat/keywords/columnar`,//关键词多柱
    smallIndex: `${APIV1}/common/index`,//非小号数据抓取
    
    
    // 用户画像
    userInfoPie: `${APIV1}/stat/personas/gender`, // 饼图
    
    user: `${APIV1}/userInfo`,

    // 发言统计
    chatsLine: `${APIV1}/stat/chats/line`
  },
}
