import { stringify } from 'qs';
import request from '../utils/request';

export async function queryProjectNotice() {
  return request('/pyapi/project/notice');
}

export async function queryActivities() {
  return request('/pyapi/activities');
}

export async function queryRule(params) {
  return request(`/pyapi/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/pyapi/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/pyapi/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/pyapi/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/pyapi/fake_chart_data');
}

export async function queryTags() {
  return request('/pyapi/tags');
}

export async function queryBasicProfile() {
  return request('/pyapi/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/pyapi/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/pyapi/fake_list?${stringify(params)}`);
}

export async function fakeAccountLogin(params) {
  return request('/pyapi/login/account', {
    method: 'POST',
    body: params,
  });
}

export async function fakeMobileLogin(params) {
  return request('/pyapi/login/mobile', {
    method: 'POST',
    body: params,
  });
}

export async function register(params) {
  return request('/pyapi/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({...params, code: params.captcha}),
  });
}

export async function queryNotices() {
  return request('/pyapi/notices');
}

export async function send_verification_code(params) {
  return request(`/pyapi/user/send_verification_code/${params.phone}`, {
    method: 'GET',
  });
}
