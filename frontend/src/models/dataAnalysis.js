import * as dataAnalysisService from '../services/dataAnalysis';
import * as stagingDataService from '../services/stagingData';
import {arrayToJson} from '../utils/JsonUtils';
import pathToRegexp from 'path-to-regexp';

export default {
  namespace: 'dataAnalysis',
  state: {
    //左侧
    isLeftSideBar: true,
    //用户拥有的 section
    sectionsJson: [],
    //现在开启的 section
    active_sections_id: ['new_launcher ' + 'init'],
    //焦点位置section名称
    focus_section_id: 'new_launcher ' + 'init',
    //加载状态
    loading: false,

    stagingDataList: [],

    project_id: '59c21ca6d845c0538f0fadd5'

    // //开启的section的内容json
    // active_sections_content: {},


  },
  reducers: {
    // 改变 left_side_bar
    toggleLeftSideBar(state, action) {
      return {
        ...state,
        isLeftSideBar: !state.isLeftSideBar
      }
    },

    // 更新sections
    setSections(state, action) {
      return {
        ...state,
        sectionsJson: action.sectionsJson
      }
    },

    // 添加一个 section
    addNewSection(state, action) {
      return {
        ...state,
        sectionsJson: {
          ...state.sectionsJson,
          [action.section["section_id"]]: action.section
        }

      }
    },

    // // add new tab to add new section
    // addLauncher() {
    //   return {
    //     ...state,
    //     active_sections_id:
    //   }
    // },

    // 添加 active section, 将 focus 移到
    addActiveSection(state, action) {
      return {
        ...state,
        active_sections_id: state.active_sections_id.concat(action.section_id),
        focus_section_id: action.section_id
      }
    },

    // 关闭 active section
    removeActiveSection(state, action) {
      // 将 action.section_name 删掉
      return {
        ...state,
        active_sections_id: state.active_sections_id.filter(section_id => section_id != action.section_id)
      }
    },

    // 替换
    replaceActiveSection(state, action) {
      return {
        ...state,
        active_sections_id: state.active_sections_id
          .filter(section_id => section_id !== action.section_id).concat(action.new_section_id),
        focus_section_id: action.section_id
      }
    },

    // 更新 active sections (看是否需要）
    setActiveSections(state, action) {
      return {
        ...state,
        active_sections_id: action.active_sections_id
      }
    },

    // 切换 focus section
    setFocusSection(state, action) {
      return {
        ...state,
        focus_section_id: action.focus_section_id
      }
    },

    // 改变 sections 好像不需要

    // 改变loading
    set_loading(state, action) {
      return {
        ...state,
        loading: action.loading
      }
    },

    // 更改 stagingDataList
    setStagingDataList(state, action) {
      return {
        ...state,
        stagingDataList: action.stagingDataList
      }
    }

  },
  effects: {
    // 获取用户所有sections
    * fetchSections(action, {call, put}) {
      const {data: sections} = yield call(dataAnalysisService.fetchSections);
      // array to json
      const sectionsJson = arrayToJson(sections, 'section_id');
      yield put({type: 'setSections', sectionsJson})

    },
    // 更新用户 section
    * updateSection(action, {call, put, select}) {
      // 开始加载
      const section_id = action.section_id;
      const sectionsJson = yield select(state => state.dataAnalysis.sectionsJson);
      const section = sectionsJson[section_id];
      const sections = yield call(dataAnalysisService.updateSection, section_id, section);

      // 停止加载
      // 显示保存成功
      // yield put({type: 'setSections', sections})

    },

    // 添加 section
    * addSection(action, {call, put, select}) {
      //todo 1. 向后台发起请求 获得section 的json 内容
      const {data: section} = yield call(dataAnalysisService.addSection, action.section);
      // 2. 添加section
      yield put({type: 'addNewSection', section: section});
      // 3. 替换原有active section
      yield put({type: 'replaceActiveSection',
        section_id:action.section.section_id,
        new_section_id: section.section_id});
      // yield put({type: 'removeActiveSection', section_id: action.section.section_id});
      // yield put({type: 'addActiveSection', section_id: section.section_id});


      // const new_active_sections_id = select(state=> state.dataAnalysis.active_sections_id);
      // new_active_sections_id.slice()

      // 4. 设置focus section
    },

    // 删除 section

    // 获取stage data set list
    * fetchStagingDatasetList(action, {call, put, select}) {
      const project_id = yield select(state => state.dataAnalysis.project_id);
      console.log("project_id", project_id);
      const {data: stagingDataList} = yield call(stagingDataService.fetchStagingDatas, project_id);
      yield put({type: 'setStagingDataList', stagingDataList})

    },


  },
  subscriptions: {
    // 当进入该页面是 获取用户所有 section
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        const match = pathToRegexp('/projects/:projectId/analysis').exec(pathname);
        if (match) {
          const projectId = match[1];
          dispatch({type: 'fetchSections'});
          dispatch({type: 'fetchStagingDatasetList'});
        }
        // if (pathname === '/project/dataAnalysis') {
        //
        // }
      });
    },

  },
};
