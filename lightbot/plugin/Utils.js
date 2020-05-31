const jsmicro_is_empty = require('jsmicro-is-empty');
const moment = require('moment');
const {
    Message
} = require('wechaty')

const isEmpty = (val) => {
  if(typeof val === 'number') {
      return false;
  } else {
      return jsmicro_is_empty.isEmpty(val);
  }
}

const isNotEmpty = (val) => {
  if(typeof val === 'number' && !isNaN(val)) {
      return true;
  } else {
      return jsmicro_is_empty.isNotEmpty(val);
  }
}

// 获取消息类型
const getMesssageType = (type) => {
    switch (type) {
        case Message.Type.Unknown:
            return 0;
        case Message.Type.Attachment:
            return 1;
        case Message.Type.Audio:
            return 2;
        case Message.Type.Contact:
            return 3;
        case Message.Type.ChatHistory:
            return 4;
        case Message.Type.Emoticon:
            return 5;
        case Message.Type.Image:
            return 6;
        case Message.Type.Text:
            return 7;
        case Message.Type.Location:
            return 8;
        case Message.Type.MiniProgram:
            return 9;
        case Message.Type.Money:
            return 10;
        case Message.Type.Recalled:
            return 11;
        case Message.Type.Url:
            return 12;
        case Message.Type.Video:
            return 13;
    }
}

module.exports = {
  isEmpty,
  isNotEmpty,
  moment,
  getMesssageType,
};
