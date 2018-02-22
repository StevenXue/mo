import {request, config} from '../utils';

const {CORS, api} = config



// 新建 新的message
export function createNewMessage(payload) {
  // _id 可能是dataset app module request comment的 任意一种的id
  // 后端根据message type 去判断，并生成对应的 通知内容

  return request(`${CORS}/message`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message_type :payload.message_type,
      sender :payload.sender,
      title :payload.title,
      content :payload.content,
      receivers :payload.receivers,
    }),
  });
}

// 获取所有的 request
export function fetchMessage() {
  return request(`${CORS}/message`);
}
