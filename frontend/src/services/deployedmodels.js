import {request, config} from '../utils';

const {CORS, api} = config

// 获取所有 public deployed models
export function fetchAllPublicServedModels(payload) {
  if (payload.privacy === 'public') {
    payload.privacy = false
  }
  return request(`${CORS}/served_model/served_models?privacy=${payload.privacy}
  &category=${payload.category}&skipping=${payload.skipping}`);
}


// 获取一个 public deployed models
export function fetchOnePublicServedModels(payload) {
  return request(`${CORS}/served_model/served_models?model_ID=${payload.model_ID}`);
}

