import {request, config} from '../utils';

const {CORS, api} = config


// 新建回答
export function createNewUserRequestAnswer(payload) {
  return request(`${CORS}/request_answer`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id:payload.user_id,
      user_request_id:payload.user_request_id,
      answer:payload.answer,
    }),
  });
}

// 获取某一个用户的所有回答
export function fetchUserRequestAnswerByUserID(payload) {
  let category = encodeURIComponent(payload.category)
  return request(`${CORS}/request_answer?user_ID=${payload.user_ID}`);
}

// 获取一个request下的所有回答
export function fetchAllAnswerOfThisUserRequest(payload) {
  return request(`${CORS}/request_answer?user_request_id=${payload.user_request_ID}`);
}

export function votesUpAnswer(payload) {
  return request(`${CORS}/request_answer/votes`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      votes_user_id : payload.votes_user_id,
      request_answer_id : payload.request_answer_id
    }),
  });
}


export function acceptAnswer(payload) {
  return request(`${CORS}/request_answer/accept`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_request_id : payload.user_request_id,
      request_answer_id : payload.request_answer_id
    }),
  });
}
