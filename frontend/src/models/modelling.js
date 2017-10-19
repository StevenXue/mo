import modelExtend from 'dva-model-extend'
import workBench from './workBench'

const modelling = modelExtend(workBench, {
  namespace: 'modelling',
})

export default modelling

