import React from 'react';
import styles from './index.less';
import {connect} from 'dva';
import {Tabs} from 'antd';
import WorkBench from './WorkBench/index';
import Launcher from './Launcher/Launcher'

import {translateDict} from '../../../../../constants';

const TabPane = Tabs.TabPane;


function MiddleArea({model, dispatch, namespace, step}) {
  const {
    sectionsJson,
    activeSectionsId,
    focusSectionsId
  } = model;

  // change state
  // const toggleLeftSideBar = () => {
  //   dispatch({
  //     type: namespace + '/toggleLeftSideBar'
  //   });
  // };
  // const addActiveSection = (sectionId) => {
  //   dispatch({
  //     type: namespace + '/addActiveSection',
  //     sectionId: sectionId
  //   });
  // };

  const setFocusSection = (sectionId) => {
    dispatch({
      type: namespace + '/setFocusSection',
      focusSectionsId: sectionId
    });
  };

  const setActiveSections = (activeSectionsId) => {
    dispatch({
      type: namespace + '/setActiveSections',
      activeSectionsId: activeSectionsId
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
    addActiveSection('new_launcher ' + Math.random())
  };
  const addActiveSection = (sectionId) => {
    dispatch({
      type: namespace + '/addActiveSection',
      sectionId: sectionId,
    })
  }

  // 被 onEdit 调用
  const remove = (targetKey) => {
    let activeKey = focusSectionsId;
    let lastIndex;
    activeSectionsId.forEach((active_sectionId, i) => {
      if (active_sectionId === targetKey) {
        lastIndex = i - 1;
        if (lastIndex < 0) {
          lastIndex = 0
        }
      }
    });
    const new_activeSectionsId = activeSectionsId.filter(active_sectionId => active_sectionId !== targetKey);

    if (lastIndex >=0 && activeKey === targetKey) {
      activeKey = new_activeSectionsId[lastIndex];
    }
    setFocusSection(activeKey);
    setActiveSections(new_activeSectionsId);
  };

  return (
    <Tabs
      // hideAdd
      onChange={onChange}
      activeKey={focusSectionsId}
      type="editable-card"
      onEdit={onEdit}
      // tabBarStyle={{
      //   //TODO 设置tab样式
      //   // flex: 1, display: 'flex', flexDirection: 'row',
      //   // backgroundColor:"#C7C7C7"
      //   // height: 49,
      //   // borderWidth: 2,
      //
      // }}
      // className={styles.tab_area}
      animated={true}
    >
      {
        activeSectionsId.map((active_sectionId, i) => {
          return (
            // 当激活的section_id 包含 new_launcher,显示launcher
            active_sectionId.includes('new_launcher') ?
              <TabPane
                tab={'Launcher'} key={active_sectionId}
              >
                <Launcher sectionId={active_sectionId} {...{model, dispatch, namespace, step}}/>
              </TabPane> :

              <TabPane
                tab={sectionsJson[active_sectionId].section_name || sectionsJson[active_sectionId][translateDict[namespace]].name}
                key={active_sectionId}
                closabel={true}>
                <WorkBench section={sectionsJson[active_sectionId]}
                           {...{model, dispatch, namespace, step}}
                />
              </TabPane>
          )
        })
      }
    </Tabs>
  );
}

export default MiddleArea;
