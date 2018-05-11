import {request, config} from '../utils'

const {CORS, api} = config


// 新建 request
export function createNewUserRequest({body, onJson}) {
  // let category = encodeURIComponent(payload.category)
  // payload.user_ID = localStorage.getItem('user_ID')
  // noinspection JSAnnotator
  console.log(body)
  return request(`${CORS}/user_requests`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }, {onJson})
}

// 更新 project
export function updateUserRequest({body, userRequestId, onJson}) {
  return request(`${CORS}/user_requests/${userRequestId}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }, {onJson})
}


// 获取某一个用户下 所有 request
export function fetchUserRequestByUserID(payload) {
  let category = encodeURIComponent(payload.category)
  return request(`${CORS}/user_requests?user_ID=${payload.user_ID}&category=${category}&skipping=${payload.skipping}`)
}


// 获取所有的 request
export function fetchAllUserRequest({payload, onJson}) {
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
  return request(`${CORS}/user_requests?${params}`, undefined, {onJson})
}


// 获取一个
export function fetchOneUserRequest(payload) {
  return request(`${CORS}/user_requests/${payload.user_request_ID}`)
}


// 关键词搜索
export function searchUserRequest(payload) {
  return request(`${CORS}/user_requests?searchStr=${payload.searchStr}`)
}

export function votesUpRequest(payload) {
  return request(`${CORS}/user_requests/votes`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      votes_user_id: payload.votes_user_id,
      user_request_id: payload.user_request_id
    }),
  })
}


export function starRequest(payload) {
  return request(`${CORS}/user_requests/star`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      star_user_id: payload.star_user_id,
      user_request_id: payload.user_request_id
    }),
  })
}

export function removeRequest(payload) {
  return request(`${CORS}/user_requests/${payload.user_request_id}`, {
    method: 'delete'
  })
}

export function getHotTagOfRequest({payload, onJson}) {
  const searchQuery=payload.searchQuery
  const requestType=payload.requestType
  return request(`${CORS}/user_requests/get_hot_tag?search_query=${searchQuery}&request_type=${requestType}`, undefined, {onJson})
}
