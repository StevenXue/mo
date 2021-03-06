import {request, config} from '../utils';

const {CORS, api} = config


// 获取某一个用户下 所有 deployed models （包括serving中的和 没serving中的）
export function fetchServedModelsByUserID(payload) {
  let category = encodeURIComponent(payload.category)
  return request(`${CORS}/served_model/served_models?user_ID=${payload.user_ID}&privacy=${payload.privacy}&category=${category}&skipping=${payload.skipping}`);
}


// 获取所有 public deployed models
export function fetchAllPublicServedModels(payload) {
  if (payload.privacy === 'public') {
    payload.privacy = false
  }
  let category = encodeURIComponent(payload.category)
  return request(`${CORS}/served_model/served_models?private=${payload.privacy}
  &category=${category}&skipping=${payload.skipping}`);
}


// 获取一个 public deployed models
export function fetchOnePublicServedModels(payload) {
  return request(`${CORS}/served_model/served_models?model_ID=${payload.model_ID}`);
}

// 获取一个 public deployed models
export function search_served_models(payload) {
  return request(`${CORS}/served_model/served_models?searchStr=${payload.searchStr}`);
}
