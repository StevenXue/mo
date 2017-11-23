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

export async function fetchDataSet(dataSet_ID, page) {
  let query
  if (page === -1) {
    query = `/${dataSet_ID}?limit=5&isLast=true`;
  } else {
    query = `/${dataSet_ID}?limit=5`;
  }

  return org_request(CORS + dataSets +query, {
    method: 'get',
  })
}

// delete dataset
export async function deleteDataSet(id) {
  let query = `/${id}`;
  return request(CORS + dataSets + query, {
    method: 'delete',
  })
}

// delete file
export async function deleteFile(id) {
  let query = `/${id}`;
  return request(CORS + files + query, {
    method: 'delete',
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

// stage data
export function stageData(dsid, prjid, name, desc) {
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

// get staging datasets
export async function fetchStagingDataSets(prjid) {
  let query = `?project_id=${prjid}&without_result=true`;
  return request(CORS + getStagingData + query, {
    method: 'get',
  })
}

// get staging dataset
export async function getStagingDataSet(sdsid, page) {
  let query
  if (page === -1) {
    query = `/${sdsid}?limit=5&isLast=true`;
  } else {
    query = `/${sdsid}?limit=5`;
  }

  return request(CORS + getStagingData + query, {
    method: 'get',
  })
}

// update staging dataset
export function updateStagingDataSet(sdsid, name, desc, tags, field) {
  return request(CORS + getStagingData, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'staging_data_set_id': sdsid,
      'staging_data_set_name': name,
      'staging_data_set_description': desc,
      'staging_data_set_tags': tags,
      'staging_data_set_field': field
    })
  })
}

// change staging data field types
export function changeStagedTypes(id, arrays) {
  let query = '/types'
  return request(CORS + getStagingData + query, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'staging_data_set_id': id,
      'f_t_arrays': arrays,
    })
  })
}

// delete staging data columns
export function deleteStagedDataColumns(id, cols) {
  let query = `/fields/${id}`;
  return request(CORS + getStagingData + query, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({'fields': cols})
  })
}


// delete staging dataset
export async function deleteStagingDataSet(sdsid) {

  let query = `/${sdsid}`;
  return request(CORS + getStagingData + query, {
    method: 'delete',
  })
}
