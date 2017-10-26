import { request, config } from '../utils'

const { CORS, api } = config;
const { projectJobs, toolkits } = api;
const PREFIX = '/sections';

// 获取用户所有sections
export async function fetchModels(payload) {

  let res = await request(`${CORS}/project/jobs/${payload.projectId}?categories=${payload.categories}&status=200`);

  return res
}

// 获取用户所有model list
// export function fetchModels() {
//   const data = [
//     // one section
//     {
//       modelName: 'longlongmodelName1',
//       modelId: '0001',
//       state: 0,
//       dataSet:'dataSet  111111',
//       performance:'performance  111111',
//       trafficOfAPI:[10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
//       modalState: {visible: false},
//     },
//   ];
//   return {
//     data,
//     headers: {},
//   }


export function deployModel(modelId, model) {
  return {
    data: {
      modelId: "000001",
      modelName: "new_section____xddd",
      state: 1,
    },
    header: {}
  };
}

// 更改section
export function stopDeployModel(modelId, model) {
  console.log("model_id", modelId);
  console.log("stop_serving_model", model);
}
