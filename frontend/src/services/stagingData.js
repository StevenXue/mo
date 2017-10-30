import request from '../utils/request';

const PREFIX = '/staging_data';

// get stage data sets
export function fetchStagingDatas(project_id) {
  // console.log(`/api${PREFIX}/staging_data_sets?project_id=${project_id}`);

  return request(`/api${PREFIX}/staging_data_sets?project_id=${project_id}&without_result=true`,
    {
      method: 'GET',
      // body: JSON.stringify(values),
    }
  );
}

// fetch stage data field
export function fetchFields(id) {
  return request(`/api${PREFIX}/staging_data_sets/fields?staging_data_set_id=${id}`, {
    method: 'GET'
  })
}

// fetch stage data
export function fetchStagingDataset(id) {
  return request(`/api${PREFIX}/staging_data_sets/${id}?limit=30`, {
    method: 'GET'
  })
}

