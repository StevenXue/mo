import {request, config} from '../utils';

const {CORS, api} = config



// 新建 request
export function createNewUserRequest(payload) {
  // let category = encodeURIComponent(payload.category)
  // payload.user_ID = localStorage.getItem('user_ID')
  // noinspection JSAnnotator
  return request(`${CORS}/user_requests`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id:payload.user_ID,
      request_title:payload.requestTitle,
      request_input:payload.requestInput,
      request_output:payload.requestOutput,
      request_description:payload.requestDescription,
      request_tags:payload.requestTags,
      request_category:payload.requestCategory,
      request_dataset:payload.requestDataset,
    }),
  });
}


// 获取某一个用户下 所有 request
export function fetchUserRequestByUserID(payload) {
  let category = encodeURIComponent(payload.category)
  return request(`${CORS}/user_requests?user_ID=${payload.user_ID}&category=${category}&skipping=${payload.skipping}`);
}


// 获取所有的 request
export function fetchAllUserRequest() {
  return request(`${CORS}/user_requests`);
}


// 获取一个
export function fetchOneUserRequest(payload) {
  return request(`${CORS}/user_requests/${payload.user_request_ID}`);
}


// 关键词搜索
export function searchUserRequest(payload) {
  return request(`${CORS}/user_requests?searchStr=${payload.searchStr}`);
}

export function votesUpRequest(payload) {
  return request(`${CORS}/user_requests/votes`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      votes_user_id : payload.votes_user_id,
      user_request_id : payload.user_request_id
    }),
  });
}



export function starRequest(payload) {
  return request(`${CORS}/user_requests/star`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      star_user_id : payload.star_user_id,
      user_request_id : payload.user_request_id
    }),
  });
}
