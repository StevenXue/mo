import {request, config} from '../utils';

const {CORS, api} = config



// 新建 request comments
export function createNewUserRequestComments(payload) {
  return request(`${CORS}/comments`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id:payload.user_id,
      user_request_id:payload.user_request_id,
      comments:payload.comments,
      comments_type:payload.comments_type,
      request_answer_id:payload.request_answer_id
    }),
  });
}


// 获取某一个用户的所有评论
export function fetchUserRequestCommentsByUserID(payload) {
  let category = encodeURIComponent(payload.category)
  return request(`${CORS}/comments?user_ID=${payload.user_ID}`);
}


// 获取一个request下的所有评论
export function fetchAllCommentsOfThisUserRequest(payload) {
  return request(`${CORS}/comments?user_request_id=${payload.user_request_ID}`);
}


// 新建 comments
export function createComments(payload) {
  return request(`${CORS}/comments`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      _id:payload._id,
      comments:payload.comments,
      comments_type:payload.comments_type
    }),
  });
}

// 获取一个request/answer/project下的所有评论
export function fetchComments({payload, onJson}) {

  let params = ''
  for (let key in payload) {
    if (!payload.hasOwnProperty(key)) {
      continue
    }
    if (payload[key]) {
      const value = payload[key]
      params += `&${key}=${value}`
    }
  }
  // console.log('payload1111',payload)
  // console.log('params',params)
  // return request(`${CORS}/comments?_id=${payload._id}&comments_type=${payload.comments_type}`);
  return request(`${CORS}/comments?${params}`, undefined, { onJson });

}
