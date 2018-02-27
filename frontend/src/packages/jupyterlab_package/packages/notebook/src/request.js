import * as fetch from 'dva/fetch'
import { message } from 'antd'
import * as _ from 'lodash'

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

    onSuccess && await onSuccess(newRes)

    const data = await newRes.json()

    onJson && await onJson(data.response)

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
    onError && await onError(err)
  }
}
