import { request, config } from '../utils'

const { CORS } = config

export function set_star_favor(payload) {
  return request(`${CORS}/user/action_entity/${payload.entity_id}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action : payload.action,
      entity : payload.entity
    }),
  });
}
