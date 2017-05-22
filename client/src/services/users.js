import request from '../utils/request';
import { PAGE_SIZE } from '../constants';

// export function fetch({ page }) {
//   return request(`/api/users?_page=${page}&_limit=${PAGE_SIZE}`);
// }
//
// export function remove(id) {
//   return request(`/api/users/${id}`, {
//     method: 'DELETE',
//   });
// }
//
// export function patch(id, values) {
//   return request(`/api/users/${id}`, {
//     method: 'PATCH',
//     body: JSON.stringify(values),
//   });
// }
//
// export function create(values) {
//   return request('/api/users', {
//     method: 'POST',
//     body: JSON.stringify(values),
//   });
// }

export function login(values) {
  console.log('in service', values.username, values.password);
  let formData = new FormData();
  formData.append("username", values.username);
  formData.append("password", values.password);
  request('http://10.52.14.182:8888/api/contents', {
    crossDomain: true,
    method: 'POST',
    headers:{
      "content-type": "application/json",
    },
    body: JSON.stringify({
      "type": "notebook"
    })
  });
}
