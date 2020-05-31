class User {
    constructor(contact) {
        if(!contact) {
            console.log('用户不存在');
            return;
        }
        this.wechat_id = contact.id;
        this.name = contact.name();
        let province = contact.province();
        if(province != null && province.length != 0) {
            this.province = province;
            this.city = contact.city();
        } else {
            this.province = '';
            this.province = '';
        }
    }

    setGender(gender) {
        this.gender = gender;
    }

    setRoomid(key) {
        this.roomid = key;
    }

    setAvatar(avatar) {
        this.avatar = avatar;
    }

    setId(id) {
        this.id = id;
    }
}

module.exports = User