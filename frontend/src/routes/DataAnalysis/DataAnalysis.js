import React from 'react';
import {connect} from 'dva';
import styles from './DataAnalysis.css';
import {Button, Tabs} from 'antd';

const TabPane = Tabs.TabPane;

const arrayToJson = (array) => {
  let finalJson = {};
  for (let i of array) {
    finalJson[i.section_id] = i;
  }
  return finalJson

};


function DataAnalysis({
                        location, dispatch, isLeftSideBar,
                        sections, toggleLeftSideBar, addActiveSection,
                        active_sections_id,
                        focus_section_id,
                      }) {
  const sectionList = () => {
    return (
      sections.map(
        (section) => {
          return (
            <div key={section.section_id + section.section_name} onClick={() => addActiveSection(section.section_id)}>
              {section.section_name}
            </div>
          )
        }
      )
    )
  };

  const callback = (key) => {
    console.log(key);
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
    return (
      <Tabs defaultActiveKey="1" onChange={callback}>
        {
          active_sections_id.map((active_section_id) => {
            return (
              <TabPane tab={sectionsJson[active_section_id].section_name} key={active_section_id + Math.random()}>
                {
                  mainArea(sectionsJson[active_section_id])
                }
              </TabPane>
            )
          })
        }
      </Tabs>
    )
  };

  const mainArea = (section) => {
    return (
      section.steps.map((step)=>{
        return (
          <div key={step.title}>
            <div>
              {step.title}
            </div>
            <div>
              {step.content}
            </div>
          </div>
        )
      })
    )
  };

  // main function
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


const mapStateToProps = ({
                           dataAnalysis: {
                             isLeftSideBar,
                             sections,
                             active_sections_id,
                             focus_section_id
                           }
                         }) => {
  return {
    isLeftSideBar,
    sections,
    active_sections_id,
    focus_section_id
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleLeftSideBar() {
      dispatch({
        type: 'dataAnalysis/toggleLeftSideBar'
      });
    },
    addActiveSection(section_id) {
      dispatch({
        type: 'dataAnalysis/addActiveSection',
        section_id: section_id
      });
    },

    dispatch,
  };


};


export default connect(mapStateToProps, mapDispatchToProps)(DataAnalysis);
