import request, { org_request } from './request'

export function getModels(onSuccess) {
  return org_request(`pyapi/model/models/public?type=true`, null, onSuccess)
}
