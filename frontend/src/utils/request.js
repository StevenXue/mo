import fetch from 'dva/fetch'
import { message } from 'antd'
import _ from 'lodash'

const onSuccessDef = function (response) {
}

const onErrorDef = function (error) {
}

function checkStatus({data, noErrorMsg, customErrorMsg, newRes}) {

  if (newRes.status >= 200 && newRes.status < 300) {
    // message.success('This is a message of success');
    return true
  }
  if(!noErrorMsg) {
    message.error('This is a message of error: ' + newRes.statusText)
    console.log("response", response)
  }
  else if(customErrorMsg){
    // console.log("response", msg.response)
    message.error(data.response)
  }

  return false
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
    const { noErrorMsg, customErrorMsg } = options
    delete options.noErrorMsg
    delete options.customErrorMsg

    const response = await fetch(url, options)
    if(onSuccess) {
      await onSuccess(response)
      return null
    }
    // const {status, statusText} = response
    const newRes = response

    const data = await response.json()
    const res = data.response || data
    if(onJson) {
      await onJson(res)
      return null
    }

    const noError = checkStatus({data, noErrorMsg, customErrorMsg, newRes})


    // 报错了就不要把data加进去了
    const ret = {
      data: res,
      res: data,
      headers: {},
      status: response.status,
      noError
    }

    if (response.headers.get('x-total-count')) {
      ret.headers['x-total-count'] = response.headers.get('x-total-count')
    }

    return ret

  } catch (err) {
    console.log(url, err)
    onError && await onError(err)
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
