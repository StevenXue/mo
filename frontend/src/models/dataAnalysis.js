import * as dataAnalysisService from '../services/dataAnalysis';
import * as stagingDataService from '../services/stagingData';

// import pathToRegexp from 'path-to-regexp';

export default {
  namespace: 'dataAnalysis',
  state: {
    //左侧
    isLeftSideBar: true,
    //用户拥有的 section
    sections: [],
    //现在开启的 section
    active_sections_id: [],
    //焦点位置section名称
    focus_section_id: "",
    //加载状态
    loading: false,

    stagingDataList: []

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
        sections: action.sections
      }
    },

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
      const active_sections_name = [];
      return {
        ...state,
        active_sections_id
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
    }

    //

  },
  effects: {
    // 获取用户所有sections
    *fetchSections(action, {call, put}) {
      const {data: sections} = yield call(dataAnalysisService.fetchSections);
      yield put({type: 'setSections', sections})

    },
    // 更新用户 section
    *updateSection(action, {call, put}) {
      // 开始加载

      const sections = yield call(dataAnalysisService.updateSection());
      // 停止加载
      // 显示保存成功
      // yield put({type: 'setSections', sections})

    },

    // 添加 section

    // 删除 section

    // 获取stage data set list
    *fetchStagingDatasetList(action, {call, put}) {
      const {data: stagingDataList} = yield call(stagingDataService.fetchStagingDatas, action.project_id);
      yield put({type: 'stagingDataList', stagingDataList})

    },


  },
  subscriptions: {
    // 当进入该页面是 获取用户所有 section
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        // const match = pathToRegexp('/users/:userId/search').exec(pathname);
        if (pathname === '/project/dataAnalysis') {
          dispatch({type: 'fetchSections'});
          dispatch({type: 'fetchStagingDatasetList'});
        }
      });
    },

  },
};
