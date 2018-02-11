import {request, config} from '../utils';

const {CORS, api} = config



// 新建 request comments
export function createNewUserRequestComments(payload) {
  return request(`${CORS}/user_request_comments`, {
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
  return request(`${CORS}/user_request_comments?user_ID=${payload.user_ID}`);
}


// 获取一个request下的所有评论
export function fetchAllCommentsOfThisUserRequest(payload) {
  return request(`${CORS}/user_request_comments?user_request_id=${payload.user_request_ID}`);
}

