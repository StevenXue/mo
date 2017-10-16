import request from '../utils/request';

const PREFIX = '/staging_data';

// get stage data sets
export function fetchStagingDatas(project_id) {
  return request(`/api${PREFIX}/staging_data_sets/project_id=${project_id}`,
    {
      method: 'GET',
      // body: JSON.stringify(values),
    }
  );
}




