/**
 * choose toolkit
 */
import React, {Component} from 'react'
import styles from './index.less'
import {connect} from 'dva'

import {Tabs, Card, Icon, Spin} from 'antd'

const TabPane = Tabs.TabPane;

function callback(key) {
  console.log(key);
}


class Launcher extends Component {

  // // change state
  // addSection = (section) => {
  //   this.props.dispatch({
  //     type: this.props.namespace + '/addSection',
  //     payload: {
  //
  //     },
  //   })
  // };


  onClick = (e) => {

    this.props.dispatch({
      type: this.props.namespace + '/addSection',
      payload: {
        algorithm_id: e._id,
        namespace: this.props.namespace,
        sectionId: this.props.sectionId,
      },
    });


    // this.addSection({
    //   sectionId: this.props.sectionId,
    //   section_type: e.name,
    // })
  };

  render() {
    // const { namespace } = this.props

    return (
      <div className={styles.launcher}>
        <h1 className={styles.title}>
          Choose a {this.props.step} to start
        </h1>
        <Spin spinning={this.props.model.spinLoading.getAlgorithms}>

          <Tabs defaultActiveKey="1" onChange={callback}
                tabBarStyle={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
          >


            {this.props.model.algorithms.map((category, index) =>

              <TabPane tab={category.name} key={index}>
                {category.children.map((e, i) =>
                  <Card key={e.name + i} onClick={() => this.onClick(e,)}
                        style={{
                          margin: 10,
                          backgroundColor: '#F8F8F8',
                        }}
                  >
                    <div className={styles.card_area}>
                      <div>
                        <div className='custom-title-font'>{e.name}</div>
                        <div className='custom-text-font'>{e.description}</div>
                      </div>
                    </div>
                  </Card>,
                )}
              </TabPane>,
            )}


          </Tabs>
        </Spin>

      </div>
    )
  }
}

export default Launcher
