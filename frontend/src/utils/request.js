import fetch from 'dva/fetch'
import { message } from 'antd'
import _ from 'lodash'

const onSuccessDef = function (response) {
}

const onErrorDef = function (error) {
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    // message.success('This is a message of success');
    return response
  }
  // const error = new Error(response.statusText)
  // error.response = response
  message.error('This is a message of error: ' + response.statusText)
  // return response
  // return error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @param  {object} [funcs] callback functions
 * @return {object}           An object containing either "data" or "err"
 */
export default async function request(url, options = {}, funcs = {}) {
  const { onSuccess, onJson, onError } = funcs
  try {
    const token = localStorage.getItem('token')
    if (token) {
      if (!_.get(options, 'headers.Authorization')) {
        _.set(options, 'headers.Authorization', 'Bearer ' + token)
      }
    }
    const response = await fetch(url, options)

    const newRes = checkStatus(response)

    await onSuccess && onSuccess(newRes)

    const data = await newRes.json()

    await onJson && onJson(data.response)

    const ret = {
      data: data.response,
      res: data,
      headers: {},
      status: response.status,
    }
    if (response.headers.get('x-total-count')) {
      ret.headers['x-total-count'] = response.headers.get('x-total-count')
    }

    return ret
  } catch (err) {
    console.log(url, err)
    await onError && onError(err)
  }
}

export async function org_request(url, options) {
  const response = await fetch(url, options)

  checkStatus(response)

  return await response.json()

}

// import fetch from 'dva/fetch';
// import { notification } from 'antd';
//
// function checkStatus(response) {
//   if (response.status >= 200 && response.status < 300) {
//     return response;
//   }
//   notification.error({
//     message: `请求错误 ${response.status}: ${response.url}`,
//     description: response.statusText,
//   });
//   const error = new Error(response.statusText);
//   error.response = response;
//   throw error;
// }
//
// /**
//  * Requests a URL, returning a promise.
//  *
//  * @param  {string} url       The URL we want to request
//  * @param  {object} [options] The options we want to pass to "fetch"
//  * @return {object}           An object containing either "data" or "err"
//  */
// export default function request(url, options) {
//   const defaultOptions = {
//     credentials: 'include',
//   };
//   const newOptions = { ...defaultOptions, ...options };
//   if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
//     newOptions.headers = {
//       Accept: 'application/json',
//       'Content-Type': 'application/json; charset=utf-8',
//       ...newOptions.headers,
//     };
//     newOptions.body = JSON.stringify(newOptions.body);
//   }
//
//   return fetch(url, newOptions)
//     .then(checkStatus)
//     .then(response => response.json())
//     .catch((error) => {
//       if (error.code) {
//         notification.error({
//           message: error.name,
//           description: error.message,
//         });
//       }
//       if ('stack' in error && 'message' in error) {
//         notification.error({
//           message: `请求错误: ${url}`,
//           description: error.message,
//         });
//       }
//       return error;
//     });
// }
