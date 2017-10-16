import React from 'react';
import {connect} from 'dva';
import styles from './DataAnalysis.css';
import {Button, Tabs} from 'antd';

import TabArea from '../../components/TabArea';
import WorkBench from '../../components/WorkBench';

const TabPane = Tabs.TabPane;

const arrayToJson = (array) => {
  let finalJson = {};
  for (let i of array) {
    finalJson[i.section_id] = i;
  }
  return finalJson

};


function DataAnalysis({location, dispatch, dataAnalysis}) {
  // state
  const {
    isLeftSideBar,
    sections,
    active_sections_id,
    focus_section_id
  } = dataAnalysis;

  // change state
  const toggleLeftSideBar = () => {
    dispatch({
      type: 'dataAnalysis/toggleLeftSideBar'
    });
  };
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


  // 当section 被点击
  const onClickSection = (section_id) => {
    //1 active sections not include this section
    if (!active_sections_id.includes(section_id)) {
      addActiveSection(section_id)
    }
    //2 include
    else {
      setFocusSection(section_id)
    }
  };


  const sectionList = () => {
    return (
      sections.map(
        (section) => {
          return (
            <div key={section.section_id + section.section_name} onClick={() => onClickSection(section.section_id)}>
              {section.section_name}
            </div>
          )
        }
      )
    )
  };

  // const callback = (key) => {
  //   console.log(key);
  // };
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
    console.log("lastIndex", lastIndex);

    const new_active_sections_id = active_sections_id.filter(active_section_id => active_section_id !== targetKey);

    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = new_active_sections_id[lastIndex];
    }
    else{
      // 如果之前没有tab
      activeKey = new_active_sections_id[lastIndex+1];
    }
    setFocusSection(activeKey);
    setActiveSections(new_active_sections_id);
    // this.setState({ panes, activeKey });
  };


  function box1() {
    if (isLeftSideBar) {
      return (
        <div className={styles.box1}>
          <Button type="primary" onClick={toggleLeftSideBar}>Primary</Button>
          {sectionList()}
        </div>
      )
    } else {

      return (
        <div className={styles.left_column}>
          <Button type="primary" onClick={toggleLeftSideBar}>Primary</Button>
        </div>
      )
    }

  }

  const box2 = () => {
    const sectionsJson = arrayToJson(sections);
    // return <TabArea/>
    return (
      <div>
        {/*<div style={{ marginBottom: 16 }}>*/}
        {/*<Button onClick={add}>ADD</Button>*/}
        {/*</div>*/}
        <Tabs
          hideAdd
          onChange={onChange}
          activeKey={focus_section_id}
          type="editable-card"
          onEdit={onEdit}
        >
          {
            active_sections_id.map((active_section_id) => {
              return (
                <TabPane
                  tab={sectionsJson[active_section_id].section_name} key={active_section_id}
                  closabel={true}>

                  <WorkBench section={sectionsJson[active_section_id]} />
                  {/*{*/}
                    {/*mainArea(sectionsJson[active_section_id])*/}
                  {/*}*/}
                </TabPane>
              )
            })
          }
        </Tabs>
      </div>
    );
  };

  // 主要操作区域
  const mainArea = (section) => {

    return (
      section.steps.map((step) => {
        return (
          <div key={step.title}>
            <div>
              {step.title}
            </div>

            {step.content ?
              <div>
                {step.content}
              </div> :
              <div>
                选择框
              </div>
            }

          </div>
        )
      })
    )
  };

  // 主函数
  return (
    <div className={styles.normal}>

      <div className={styles.content}>

        {box1()}

        <div className={styles.box2}>
          {box2()}
        </div>

        <div className={styles.box3}>
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
