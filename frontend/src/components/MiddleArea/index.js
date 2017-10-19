import React from 'react';
import styles from './index.less';
import {connect} from 'dva';
import {Tabs} from 'antd';
import WorkBench from './WorkBench';
import Launcher from './Launcher/Launcher'

const TabPane = Tabs.TabPane;


function MiddleArea({model, dispatch, namespace}) {
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

  // const add = () => {
  //   const activeKey = `newTab${Math.random()}`;
  //   addActiveSection(activeKey);
  //
  // };

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
    console.log("lastIndex", lastIndex);
    console.log("new_activeSectionsId", new_activeSectionsId);

    if (lastIndex >=0 && activeKey === targetKey) {

      activeKey = new_activeSectionsId[lastIndex];
      console.log("activeKey", activeKey);
    }
    setFocusSection(activeKey);
    setActiveSections(new_activeSectionsId);
  };

  return (
    <Tabs
      hideAdd
      onChange={onChange}
      activeKey={focusSectionsId}
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
        activeSectionsId.map((active_sectionId, i) => {
          return (
            active_sectionId.includes('new_launcher') ?
              <TabPane
                tab={'Launcher'} key={active_sectionId}
              >
                <Launcher sectionId={active_sectionId} {...{model, dispatch, namespace}}/>

              </TabPane> :
              <TabPane
                tab={sectionsJson[active_sectionId].section_name || sectionsJson[active_sectionId]._id} key={active_sectionId}
                closabel={true}>
                <WorkBench section={sectionsJson[active_sectionId]}
                           {...{model, dispatch, namespace}}
                />
              </TabPane>
          )
        })
      }
    </Tabs>
  );
}

export default MiddleArea;
