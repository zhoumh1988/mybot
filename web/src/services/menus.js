import {EnumRoleType} from 'enums'

/**
 * 属性说明
 * id: string, 唯一id
 * bpid: string, 面包屑导航的父id
 * mpid: string, 菜单的父id,缺省时为一级菜单,为-1时在菜单中不显示
 * name: 显示名称
 * route: 匹配路由,缺省时不做跳转
 * icon: 在名称前显示的图标
 */

export const menus = [
    {
        id: '1',
        icon: 'home',
        name: '首页',
        route: '/home'
    }, {
        id: '2',
        // bpid: '1',
        icon: 'statistics',
        name: '统计分析'
    },

    {
        id: '20',
        bpid: '2',
        mpid: '2',
        name: '发言统计',
        route: '/stat/chats'
    },
    
    // 活跃度
    {
        id: '21',
        bpid: '2',
        mpid: '2',
        name: '活跃度'
    }, {
        id: '211',
        bpid: '21',
        mpid: '21',
        name: '总体',
        route: '/dashboard/totalLine'
    }, {
        id: '212',
        bpid: '21',
        mpid: '21',
        name: '群统计',
        route: '/group'
    }, {
        id: '213',
        bpid: '21',
        mpid: '21',
        name: '用户',
        route: '/dashboard/userLine'
    }, {
        id: '214',
        bpid: '21',
        mpid: '21',
        name: '管理员',
        route: '/stat-admin'
    },
    // 回复字数
    {
        id: '22',
        bpid: '2',
        mpid: '2',
        name: '回复字数'
    }, {
        id: '221',
        bpid: '22',
        mpid: '22',
        name: '总体',
        route: '/dashboard/totalWord',
    }, {
        id: '222',
        bpid: '22',
        mpid: '22',
        name: '群统计',
        route: '/group/word'
    }, {
        id: '223',
        bpid: '22',
        mpid: '22',
        name: '用户',
        route: '/dashboard/userWord'
    }, {
        id: '224',
        bpid: '22',
        mpid: '22',
        name: '管理员',
        route: '/stat-admin/word'
    },
    //
    //  {
    //     id: '21',
    //     bpid: '2',
    //     mpid: '2',
    //     name: '总体'
    // }, {
    //     id: '211',
    //     bpid: '21',
    //     mpid: '21',
    //     name: '活跃度',
    //     route: '/dashboard/totalLine'
    // }, {
    //     id: '212',
    //     bpid: '21',
    //     mpid: '21',
    //     name: '回复字数',
    //     route: '/dashboard/totalWord'
    // }, {
    //     id: '22',
    //     bpid: '2',
    //     mpid: '2',
    //     name: '群统计'
    // }, {
    //     id: '221',
    //     bpid: '22',
    //     mpid: '22',
    //     name: '活跃度',
    //     route: '/group'
    // }, {
    //     id: '222',
    //     bpid: '22',
    //     mpid: '22',
    //     name: '回复字数',
    //     route: '/group/word'
    // }, {
    //     id: '23',
    //     bpid: '2',
    //     mpid: '2',
    //     name: '用户统计'
    // }, {
    //     id: '231',
    //     bpid: '23',
    //     mpid: '23',
    //     name: '活跃度',
    //     route: '/dashboard/userLine'
    // }, {
    //     id: '232',
    //     bpid: '23',
    //     mpid: '23',
    //     name: '回复字数',
    //     route: '/dashboard/userWord'
    // }, {
    //     id: '24',
    //     bpid: '2',
    //     mpid: '2',
    //     name: '管理员统计'
    // }, {
    //     id: '241',
    //     bpid: '24',
    //     mpid: '24',
    //     name: '活跃度',
    //     route: '/stat-admin'
    // }, {
    //     id: '242',
    //     bpid: '24',
    //     mpid: '24',
    //     name: '回复字数',
    //     route: '/stat-admin/word'
    // }, 

    {
        id: '25',
        bpid: '2',
        mpid: '2',
        name: '用户画像',
        route: '/stat/userinfo'
    }, {
        id: '26',
        bpid: '2',
        mpid: '2',
        name: '关键词曝光',
        route: '/stat/keyword'
    }, {
        id: '4',
        // bpid: '1',
        name: '关键词',
        icon: 'keywords',
        authority: [EnumRoleType.ADMIN]
    }, {
        id: '41',
        bpid: '4',
        mpid: '4',
        name: '关键词回复',
        route: '/keywords',
        authority: [EnumRoleType.ADMIN]
    }, {
        id: '42',
        bpid: '4',
        mpid: '4',
        name: '敏感词警告',
        route: '/fouls',
        authority: [EnumRoleType.ADMIN]
    }, {
        id: '5',
        // bpid: '1',
        name: '聊天管理',
        icon: 'chats'
    }, {
        id: '51',
        bpid: '5',
        mpid: '5',
        name: '聊天记录',
        route: '/chats'
    }, {
        id: '52',
        bpid: '5',
        mpid: '5',
        name: '对话模式',
        route: '/chat-model'
    }, {
        id: '53',
        bpid: '5',
        mpid: '5',
        name: '违规管理',
        route: '/illegalUser',
        authority: [EnumRoleType.ADMIN]
    }, {
        id: '9',
        // bpid: '1',
        name: '系统配置',
        icon: 'setting',
        authority: [EnumRoleType.ADMIN]
    }, {
        id: '91',
        bpid: '9',
        mpid: '9',
        name: '用户管理',
        route: '/contact',
        authority: [EnumRoleType.ADMIN]
    }, {
        id: '92',
        bpid: '9',
        mpid: '9',
        name: '群组管理',
        route: '/rooms',
        authority: [EnumRoleType.ADMIN]
    }, {
        id: '93',
        bpid: '9',
        mpid: '9',
        name: '系统账户',
        route: '/account',
        authority: [EnumRoleType.ADMIN]
    }
    // , {     id: '94',     bpid: '9',     mpid: '9',     name: '账户信息',     route:
    // '/account/userInfo',     authority: [EnumRoleType.ADMIN] } , {     id: '9',
    //   bpid: '1',     name: '账户信息',     route: '/account/userInfo',     icon:
    // 'setting',     authority: [EnumRoleType.DEFAULT] }
];