import { request, config, org_request } from '../utils';
const { api, CORS } = config;
const { files, dataSets, getStagingData } = api;

export async function uploadFile (body) {
  return request(CORS + files, {
    method: 'post',
    body,
  })
}

export async function fetchDataSets () {
  const user_ID = localStorage.getItem('user_ID')
  let query = `?user_ID=${user_ID}`;
  return request(CORS + dataSets + query, {
    method: 'get',
  })
}

export async function fetchDataSet(dataSet_ID) {
  let query = `/${dataSet_ID}?limit=5`;
  return org_request(CORS + dataSets +query, {
    method: 'get',
  })
}

// delete data columns
export function deleteDataColumns(id, cols) {
  let query = `/fields/${id}`;
  return request(CORS + dataSets + query, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({'fields': cols})
  })
}

// change field types
export function changeTypes(id, arrays) {
  let query = '/types'
  return request(CORS + dataSets + query, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'data_set_id': id,
      'f_t_arrays': arrays,
    })
  })
}

// state data
export function stateData(dsid, prjid, name, desc) {
  return request(CORS + getStagingData, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'data_set_id': dsid,
      'project_id': prjid,
      'staging_data_set_name': name,
      'staging_data_set_description': desc
    })
  })
}

// get staging dataset
export async function fetchStagingDataSet(prjid) {
  // let query = `?project_id=59eff5d7ab111732796cef13&without_result=true`;

  let query = `?project_id=${prjid}&without_result=true`;
  return request(CORS + getStagingData + query, {
    method: 'get',
  })
}
