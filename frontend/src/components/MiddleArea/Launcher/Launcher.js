/**
 * choose toolkit
 */
import React, { Component } from 'react'
import styles from './index.less'
import { connect } from 'dva'

import { Tabs, Card, Icon } from 'antd'

const TabPane = Tabs.TabPane

function callback(key) {
  console.log(key)
}

const config = [
  {
    name: 'K-mean',
    description: 'xxxx',
  },
  {
    name: 'StandardScaler',
    description: 'xxxx',
  },
  {
    name: 'MinMaxScaler',
    description: 'xxxx',
  },
  {
    name: 'OneHotEncoder',
    description: 'xxxx',
  },
  {
    name: 'FunctionTransformer',
    description: 'xxxx',
  },
  {
    name: 'FunctsionTransformer',
    description: 'xxxx',
  },
]

const toolkit = [
  {
    name: 'Data Explore',
    key: 1,
    children: config,
  },

  {
    name: 'Data Quality Improve',
    key: 2,
    children: [
      {
        name: 'test1',
        description: 'xxxx',
      },
    ],
  },

  {
    name: 'Feature Selection',
    key: 3,
    children: [
      {
        name: 'test2',
        description: 'xxxx',
      },
    ],
  },

]

class Launcher extends Component {

  // change state
  addSection = (section) => {
    this.props.dispatch({
      type: this.props.namespace + '/addSection',
      section: section,
    })
  }

  onClick = (e) => {
    // 更改选中状态

    this.addSection({
      sectionId: this.props.sectionId,
      section_type: e.name,
    })
  }

  render() {
    const { namespace } = this.props

    return (
      <div className={styles.launcher}>
        <h1 className={styles.title}>
          Choose a {this.props.step} to start
        </h1>
        <Tabs defaultActiveKey="1" onChange={callback}
              tabBarStyle={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
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

      </div>
    )
  }
}

export default Launcher
