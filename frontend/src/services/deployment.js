import { request, config } from '../utils'
import React from 'react';
import {message} from 'antd';
const { CORS, api } = config;
const { projectJobs, toolkits } = api;
const PREFIX = '/models';

// 获取用户所有models
export async function fetchModels(payload) {
  return await request(`${CORS}/project/jobs/${payload.projectId}?categories=${payload.categories}&status=200`);
}

// 首次 deploy model
export async function firstDeployModel(payload) {

  let response =  await request(`${CORS}/served_model/first_deploy/${payload.jobID}`,
    {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  console.log(response);
  if (response){
    message.info('Deploy Success');
  }
  return response
}
// 更新 deploy model 的信息
export async function updateDeployModelInfo(payload) {
  let response =  await request(`${CORS}/served_model/update/${payload.served_model_id}`,
    {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  console.log(response);
  if (response){
    message.info('Model Info Update Success');
  }
  return response
}
// undeploy model
export async function undeployModel(payload) {
  let response =  await request(`${CORS}/served_model/terminate/${payload.served_model_id}`,
    {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  console.log(response);
  if (response){
    message.info('Model terminate Success');
  }
  return response
}

// deploy model
export async function resumeModel(payload) {
  let response =  await request(`${CORS}/served_model/resume/${payload.served_model_id}`,
    {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  console.log(response);
  if (response){
    message.info('Model deploy Success');
  }
  return response
}

// get prediction
export async function getPrediction(payload) {
  let response =  await request(`${CORS}/served_model/predict/${payload.served_model_id}`,
    {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  console.log(response);
  return response
}
