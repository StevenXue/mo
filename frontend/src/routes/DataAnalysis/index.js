import React from 'react';
import {connect} from 'dva';
import styles from './index.less';

import SideBar from '../../components/SideBar';
import MiddleArea from '../../components/MiddleArea';


function DataAnalysis({location, dispatch, dataAnalysis}) {
  // 主函数
  return (
    <div className={styles.container}>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <SideBar
            model={dataAnalysis}
            namespace='dataAnalysis'
            dispatch={dispatch}
          />
        </div>


        <div className={styles.middle_area}>
          <MiddleArea
            model={dataAnalysis}
            namespace='dataAnalysis'
            dispatch={dispatch}
          />
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
