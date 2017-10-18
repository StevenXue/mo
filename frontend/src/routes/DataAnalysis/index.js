import React from 'react';
import {connect} from 'dva';
import styles from './index.less';
import {Tabs} from 'antd';

// import TabArea from '../../components/useless/TabArea';
import WorkBench from '../../components/WorkBench';
import SideBar from '../../components/SideBar';
import Launcher from './Launcher'
const TabPane = Tabs.TabPane;

import {arrayToJson, JsonToArray} from '../../utils/JsonUtils';

// const arrayToJson = (array) => {
//   let finalJson = {};
//   for (let i of array) {
//     finalJson[i.section_id] = i;
//   }
//   return finalJson
// };

function DataAnalysis({location, dispatch, dataAnalysis}) {
  // state
  const {
    sectionsJson,
    active_sections_id,
    focus_section_id
  } = dataAnalysis;


  const addActiveSection = (section_id) => {
    dispatch({
      type: 'dataAnalysis/addActiveSection',
      section_id: section_id
    });
  };

  const setFocusSection = (section_id) => {
    dispatch({
      type: 'dataAnalysis/setFocusSection',
      focus_section_id: section_id
    });
  };

  const setActiveSections = (active_sections_id) => {
    dispatch({
      type: 'dataAnalysis/setActiveSections',
      active_sections_id: active_sections_id
    });
  };


  /**** tab ****/
  const onChange = (activeKey) => {
    // 更改 active key
    setFocusSection(activeKey)
  };

  const onEdit = (targetKey, action) => {
    console.log(action);
    eval(action)(targetKey);
  };

  const add = () => {
    // const panes = this.state.panes;
    const activeKey = `newTab${Math.random()}`;
    // panes.push({ title: 'New Tab', content: 'Content of new Tab', key: activeKey });

    addActiveSection(activeKey);

    // this.setState({ panes, activeKey });
  };

  const remove = (targetKey) => {

    let activeKey = focus_section_id;
    let lastIndex;
    active_sections_id.forEach((active_section_id, i) => {
      if (active_section_id === targetKey) {
        lastIndex = i - 1;
      }
    });

    const new_active_sections_id = active_sections_id.filter(active_section_id => active_section_id !== targetKey);

    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = new_active_sections_id[lastIndex];
    }
    else {
      // 如果之前没有tab
      activeKey = new_active_sections_id[lastIndex + 1];
    }
    setFocusSection(activeKey);
    setActiveSections(new_active_sections_id);
    // this.setState({ panes, activeKey });
  };

  // todo
  // 如果不存在tabs 显示Launcher
  // if(active_sections_id){
  //
  // }

  // 主函数
  return (
    <div className={styles.container}>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <SideBar/>
        </div>

        <div className={styles.middle_area}>
          <Tabs
            hideAdd
            onChange={onChange}
            activeKey={focus_section_id}
            type="editable-card"
            onEdit={onEdit}
            tabBarStyle={{
              // flex: 1, display: 'flex', flexDirection: 'row',
              // backgroundColor:"#C7C7C7"
            }}
            className={styles.tab_area}
            animated={true}
          >
            {
              active_sections_id.map((active_section_id) => {
                return (
                  active_section_id.includes('new_launcher') ?
                    <TabPane
                      tab={'Launcher'} key={active_section_id}
                    >
                      <Launcher section_id={active_section_id}/>

                    </TabPane> :
                    <TabPane
                      tab={sectionsJson[active_section_id].section_name} key={active_section_id}
                      closabel={true}>
                      <WorkBench section={sectionsJson[active_section_id]}/>
                    </TabPane>
                )
              })
            }
          </Tabs>
        </div>

        <div className={styles.right_area}>
        </div>

      </div>
    </div>
  );
}


//

export default connect(({dataAnalysis}) => ({dataAnalysis}))(DataAnalysis);

// const mapDispatchToProps = (dispatch) => {
//   return {
//     toggleLeftSideBar() {
//       dispatch({
//         type: 'dataAnalysis/toggleLeftSideBar'
//       });
//     },
//     addActiveSection(section_id) {
//       dispatch({
//         type: 'dataAnalysis/addActiveSection',
//         section_id: section_id
//       });
//     },
//     dispatch,
//   };
//
//
// };
// const mapStateToProps = ({
//                            dataAnalysis: {
//                              isLeftSideBar,
//                              sections,
//                              active_sections_id,
//                              focus_section_id
//                            }
//                          }) => {
//   return {
//     isLeftSideBar,
//     sections,
//     active_sections_id,
//     focus_section_id
//   };
// };
