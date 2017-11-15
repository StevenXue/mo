import React from 'react'
import { Spin, Button } from 'antd'
import { connect } from 'dva'
import Jupyter from 'react-jupyter'
import JupyterNotebook from '../../modelling/Notebook'
import SideBar from '../components/SideBar/index'
import MiddleArea from '../components/MiddleArea/index'
import RightArea from '../components/RightArea/index'
import styles from './index.less'

function Common(props) {
  const { notebook, dispatch } = props

  const renderNotebookSection = () => {
    return (
      <div>
        <Button className='notebook-start-button' type='primary' style={{ marginTop: 20, width: 120 }}
                onClick={() => dispatch({ type: 'notebook/startNotebook' })}>
          <a
            // href="#notebookSection"
          >
            Start Notebook
          </a>
        </Button>
        <div id="notebookSection">
          {notebook.start_notebook &&
          <JupyterNotebook user_id={notebook.userId}
                           notebook_content={notebook.notebook}
                           notebook_name={notebook.notebookName}
                           project_name={notebook.name}
                           project_id={notebook._id}
                           dataset_name={'dd'}
                           dataset_id={'11'}
                           spawn_new={notebook.spawn_new}
                           columns={notebook.columns}
                           port={notebook.port}
          />
          }
        </div>
      </div>
    )
    // if (this.props.project.isPublic) {
    //   return (
    //     !isEmpty(this.props.project.notebookContent) &&
    //     <div style={{ width: '80%', marginLeft: 80, marginTop: 50 }}>
    //       <Jupyter
    //         notebook={notebook.notebookContent}
    //         showCode={true}
    //         defaultStyle={true}
    //         loadMathjax={true}
    //       />
    //     </div>
    //   )
    // } else {
    //   return (
    //     <div>
    //       <Button className='notebook-start-button' type='primary' style={{ marginTop: 20, width: 120 }}
    //               onClick={() => this.startNotebook()}>
    //         <a href="#notebookSection">
    //           Start Notebook
    //         </a>
    //       </Button>
    //       <div id="notebookSection">
    //         {notebook.start_notebook &&
    //         <JupyterNotebook user_id={notebook.userId}
    //                          notebook_content={notebook.notebook}
    //                          notebook_name={notebook.notebookName}
    //                          project_name={notebook.name}
    //                          project_id={notebook._id}
    //                          dataset_name={'dd'}
    //                          dataset_id={'11'}
    //                          spawn_new={notebook.spawn_new}
    //                          columns={notebook.columns}
    //                          port={notebook.port}
    //         />
    //         }
    //       </div>
    //     </div>
    //   )
    // }
  }

  return (
    <div className={styles.container}>

      <Spin spinning={false}>

        <div className={styles.content}>
          <div className={styles.sidebar}>
            <SideBar
              {...props}
            />
          </div>
          <div className={styles.middle_area}>
            <MiddleArea
              {...props}
            />
          </div>
          <div className={styles.right_area}>
            <RightArea
              {...props}
            />
          </div>
        </div>
      </Spin>

      <div className={styles.go_guide}>
        {renderNotebookSection()}
        <Button onClick={() => props.dispatch({
          type: props.namespace + '/setShowGuidance',
          payload: {
            showGuidance: true,
          },
        })}>
          go to guidance
        </Button>
      </div>

    </div>
  )
}

export default connect(({ notebook }) => ({ notebook }))(Common)

// export default Common;
