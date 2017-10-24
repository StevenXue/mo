import * as dataAnalysisService from '../services/dataAnalysis'
import * as stagingDataService from '../services/stagingData'
import * as modelService from '../services/model'
import {arrayToJson} from '../utils/JsonUtils'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace: 'workBench',
  state: {
    //左侧
    isLeftSideBar: true,
    //用户拥有的 section
    sectionsJson: {},
    //现在开启的 section
    activeSectionsId: ['new_launcher ' + 'init'],
    //焦点位置section名称
    focusSectionsId: 'new_launcher ' + 'init',
    //加载状态
    loading: false,

    stagingDataList: [],

    launchItems: [],

    // 渲染launcher页面，能提供toolkit
    algorithms: [],

    // 右侧激活的preview表格

    projectId: null,


  },
  reducers: {
    // 改变 left_side_bar
    toggleLeftSideBar(state, action) {
      return {
        ...state,
        isLeftSideBar: !state.isLeftSideBar,
      }
    },

    // 更新sections
    setSections(state, action) {
      return {
        ...state,
        sectionsJson: action.payload.sectionsJson,
      }
    },

    // 添加一个 section
    addNewSection(state, action) {
      return {
        ...state,
        sectionsJson: {
          ...state.sectionsJson,
          [action.payload.section['_id']]: action.payload.section,
        },

      }
    },

    // 添加 active section, 将 focus 移到
    addActiveSection(state, action) {
      return {
        ...state,
        activeSectionsId: state.activeSectionsId.concat(action.sectionId),
        focusSectionsId: action.sectionId,
      }
    },

    // 关闭 active section
    removeActiveSection(state, action) {
      // 将 action.section_name 删掉
      return {
        ...state,
        activeSectionsId: state.activeSectionsId.filter(sectionId => sectionId !== action.sectionId),
      }
    },

    // 替换
    replaceActiveSection(state, action) {
      return {
        ...state,
        activeSectionsId: state.activeSectionsId
          .filter(sectionId => sectionId !== action.payload.oldSectionId).concat(action.payload.newSectionId),
        focusSectionsId: action.payload.newSectionId,
      }
    },

    // 更新 active sections (看是否需要）
    setActiveSections(state, action) {
      return {
        ...state,
        activeSectionsId: action.activeSectionsId,
      }
    },

    // 切换 focus section
    setFocusSection(state, action) {
      return {
        ...state,
        focusSectionsId: action.focusSectionsId,
      }
    },

    // 改变 sections 好像不需要

    // 改变loading
    set_loading(state, action) {
      return {
        ...state,
        loading: action.loading,
      }
    },

    // 更改 stagingDataList
    setStagingDataList(state, action) {
      return {
        ...state,
        stagingDataList: action.stagingDataList,
      }
    },

    // 储存 algorithms
    setAlgorithms(state, action) {
      return {
        ...state,
        algorithms: action.payload.algorithms,
      }
    },

    setProjectId(state, action) {
      return {
        ...state,
        projectId: action.payload.projectId,
      }
    },

    deleteSectionR(state, action) {
      let newsectionsJson = state.sectionsJson;
      delete newsectionsJson[action.payload.sectionId];
      return {
        ...state,
        sectionsJson: newsectionsJson
      }
    },

    // 去除active section
    removeActiveSection(state, action) {
      let targetKey = action.payload.targetKey;
      let activeKey = state.focusSectionsId;
      let lastIndex;
      state.activeSectionsId.forEach((active_sectionId, i) => {
        if (active_sectionId === targetKey) {
          lastIndex = i - 1;
          if (lastIndex < 0) {
            lastIndex = 0
          }
        }
      });

      const new_activeSectionsId = state.activeSectionsId.filter(active_sectionId => active_sectionId !== targetKey);
      console.log("lastIndex", lastIndex);
      console.log("new_activeSectionsId", new_activeSectionsId);

      if (lastIndex >= 0 && activeKey === targetKey) {
        activeKey = new_activeSectionsId[lastIndex];
        console.log("activeKey", activeKey);
      }

      return {
        ...state,
        focusSectionsId: activeKey,
        activeSectionsId: new_activeSectionsId
      }
    },

    //
    updateSteps(state, action) {

    },

    addRemoveField(state, action) {
      const fieldName = action.payload.fieldName;
      const section = state.sectionsJson[action.payload.sectionId];
      const values = section.steps[1].args[0].values;
      if (!values.includes(fieldName)) {
        values.push(fieldName);
        console.log("push", values);

      } else {
        values.splice(values.indexOf(fieldName),1);
        console.log("pop", values);

      }
      section.steps[1].args[0].values = values;

      console.log("section", section);

      return {
        ...state,
        sectionsJson: {
          ...state.sectionsJson,
          [action.payload.sectionId]: section

        }
      }
    }

  },
  effects: {
    // 获取用户所有sections
    * fetchSections(action, {call, put}) {
      const {data: {[action.categories]: sections}} = yield call(dataAnalysisService.fetchSections, {
        projectId: action.projectId,
        categories: action.categories,
      });
      // array to json
      const sectionsJson = arrayToJson(sections, '_id');
      yield put({type: 'setSections', payload: {sectionsJson: sectionsJson}})
    },

    * fetchAlgorithms(action, {call, put}) {
      const requestFunc = {
        toolkit: dataAnalysisService.fetchToolkits,
        model: modelService.fetchModels,
      };
      const {data: algorithms} = yield call(requestFunc[action.categories]);
      yield put({type: 'setAlgorithms', payload: {algorithms: algorithms}})
    },
    // 删除 section

    // 获取stage data set list
    * fetchStagingDatasetList(action, {call, put, select}) {
      const projectId = action.projectId;
      const {data: stagingDataList} = yield call(stagingDataService.fetchStagingDatas, projectId);
      yield put({type: 'setStagingDataList', stagingDataList})

    },

    // 保存section
    * saveSection(action, {call, put, select}) {
      const sectionsJson = yield select(state => state.dataAnalysis.sectionsJson);
      const section = sectionsJson[action.payload.sectionId];

      const {data: result} = yield call(dataAnalysisService.saveSection, {section: section})
      // 没有后续操作了？
    },

    //删除section
    * deleteSection(action, {call, put, select}) {
      //1. 后端删除
      const {data} = yield call(dataAnalysisService.deleteSection, {sectionId: action.payload.sectionId});

      //2. 前端删除
      if (data) {
        console.log("delete " + action.payload.sectionId);
        yield put({type: 'removeActiveSection', payload: {targetKey: action.payload.sectionId}});

        yield put({type: 'deleteSectionR', payload: {sectionId: action.payload.sectionId}});

      }

    },

    // 获取fields
    * getFields(action, {call, put, select}) {
      const sectionsJson = yield select(state => state.dataAnalysis.sectionsJson);
      // const section = sectionsJson[action.payload.sectionId];
      const {data} = yield call(stagingDataService.fetchFields, action.payload.stagingDatasetId);
      sectionsJson[action.payload.sectionId].steps[1].args[0].fields = data;
      yield put({type: 'setSections', payload: {sectionsJson: sectionsJson}});

    }

  },
  subscriptions: {
    // 当进入该页面是 获取用户所有 section
    // setup({ dispatch, history }) {
    //   const pathJson = {
    //     analysis: 'toolkit',
    //     modelling: 'model',
    //   };
    //   return history.listen(({ pathname }) => {
    //     const match = pathToRegexp('/projects/:projectId/:categories').exec(pathname)
    //     if (match) {
    //       let projectId = match[1];
    //       let path = match[2];
    //       if (path in pathJson) {
    //         const categories = pathJson[path];
    //         dispatch({ type: 'fetchSections', projectId: projectId, categories })
    //         dispatch({ type: 'fetchAlgorithms', categories });
    //         dispatch({ type: 'fetchStagingDatasetList' });
    //       }
    //     }
    //   })
    // },
  },
}
