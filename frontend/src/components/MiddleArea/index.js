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
    active_sections_id,
    focus_section_id
  } = model;

  // change state
  // const toggleLeftSideBar = () => {
  //   dispatch({
  //     type: namespace + '/toggleLeftSideBar'
  //   });
  // };
  // const addActiveSection = (section_id) => {
  //   dispatch({
  //     type: namespace + '/addActiveSection',
  //     section_id: section_id
  //   });
  // };

  const setFocusSection = (section_id) => {
    dispatch({
      type: namespace + '/setFocusSection',
      focus_section_id: section_id
    });
  };

  const setActiveSections = (active_sections_id) => {
    dispatch({
      type: namespace + '/setActiveSections',
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

  // const add = () => {
  //   const activeKey = `newTab${Math.random()}`;
  //   addActiveSection(activeKey);
  //
  // };

  // 被 onEdit 调用
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

  return (
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
                <WorkBench section={sectionsJson[active_section_id]}
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
