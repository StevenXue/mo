import * as dataAnalysisService from '../services/dataAnalysis';


export default {
  namespace: 'data_analysis',
  state: {
    //左侧
    showLeftSideBar: true,
    //用户拥有的 section
    sections: [],
    //现在开启的 section
    active_sections_name: [],
    //焦点位置section名称
    focus_section_name: "",
    //加载状态
    loading: false,


    // //开启的section的内容json
    // active_sections_content: {},


  },
  reducers: {
    // 改变 left_side_bar
    toggleLeftSiderBar(state, action) {
      return {
        ...state,
        showLeftSideBar: !state.showLeftSideBar
      }
    },

    // 更新sections
    setSections(state, action) {
      return {
        ...state,
        sections: action.sections
      }
    },

    // 添加 active section
    addActiveSection(state, action) {
      return {
        ...state,
        active_sections_name: state.active_sections_name.concat(action.section_name)
      }
    },

    // 关闭 active section
    removeActiveSection(state, action) {
      // 将 action.section_name 删掉
      const active_sections_name = [];
      return {
        ...state,
        active_sections_name
      }
    },

    // 切换 focus section
    set_focus_section(state, action) {
      return {
        ...state,
        focus_section_name: action.section_name
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
      const sections = yield call(dataAnalysisService.fetchSections);
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
  },
  subscriptions: {
    // 当进入该页面是 获取用户所有 section
    setup({dispatch, history}) {
      return history.listen(({pathname}) => {
        if (pathname === '/project/dataAnalysis') {
          dispatch({type: 'fetchSections'});
        }
      });
    },

  },
};
