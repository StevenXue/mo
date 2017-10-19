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
  state = {
    choice: null,
  }
  addSection = (section) => {
    this.props.dispatch({
      type: this.props.namespace + '/addSection',
      section: section,
    })
  }

  onClickIcon = () => {
    // 更改选中状态

  }

  onClick = (e) => {
    // 更改选中状态
    console.log(this.state)
    console.log(e.name)

    this.addSection({
      sectionId: this.props.sectionId,
      section_type: e.name,
    })
  }

  render() {
    return (
      <div className={styles.launcher}>
        <h1>
          Choose a toolkit to start
        </h1>

        <Tabs defaultActiveKey="1" onChange={callback}>

          {toolkit.map(category =>

            <TabPane tab={category.name} key={category.key}>
              {category.children.map((e, i) =>
                <Card key={e.name + i} onClick={() => this.onClick(e,)}
                      style={{ margin: 10, width: '100%', backgroundColor: '#F8F8F8' }}>
                  <div className={styles.card_area}>
                    <div>
                      <p className='custom-title-font'>{e.name}</p>
                      <p className='custom-text-font'>{e.description}</p>
                    </div>
                    <Icon type="check-circle"
                          onClick={this.onClickIcon}
                          style={{ fontSize: 20 }}/>
                  </div>
                </Card>,
              )}
            </TabPane>,
          )}

          {/*<TabPane tab="Data Explore" key="1">*/}
          {/*{config.map((e, i)=>*/}
          {/*<Card key={e.name+i} onClick={()=>this.onClick(e, )}*/}
          {/*style={{margin: 10, width: '100%', backgroundColor: '#F8F8F8'}}>*/}
          {/*<div className={styles.card_area}>*/}
          {/*<div>*/}
          {/*<p className='custom-title-font'>{e.name}</p>*/}
          {/*<p className='custom-text-font'>{e.description}</p>*/}
          {/*</div>*/}
          {/*<Icon type="check-circle"*/}
          {/*onClick={this.onClickIcon}*/}
          {/*style={{fontSize:20}}/>*/}
          {/*</div>*/}
          {/*</Card>*/}
          {/*)}*/}
          {/*</TabPane>*/}
          {/*<TabPane tab="Data Quality Improve" key="2">Content of Tab Pane 2</TabPane>*/}
          {/*<TabPane tab="Feature Selection" key="3">Content of Tab Pane 3</TabPane>*/}
        </Tabs>

      </div>
    )
  }
}

export default connect(({ dataAnalysis }) => ({ dataAnalysis }))(Launcher)
