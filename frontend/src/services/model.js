import { request, config } from '../utils'

const { CORS, api } = config
const { models } = api

export async function fetchModels(payload) {
  return await request(`${CORS}${models}`)
}
