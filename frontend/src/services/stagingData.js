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




