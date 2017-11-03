import React from 'react';
import styles from './TabArea.css';


import { Tabs, Button } from 'antd';
const TabPane = Tabs.TabPane;

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    const panes_1 = [
      { title: 'Tab 1', content: 'Content of Tab Pane 1', key: '1' },
      { title: 'Tab 2', content: 'Content of Tab Pane 2', key: '2' },
    ];
    this.state = {
      activeKey_1: panes_1[0].key,
      panes_1,
    };
  }

  onChange = (activeKey_1) => {
    this.setState({ activeKey_1 });
  }
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  }
  add = () => {
    const panes_1 = this.state.panes_1;
    const activeKey_1 = `newTab${this.newTabIndex++}`;
    panes_1.push({ title: 'New Tab', content: 'New Tab Pane', key: activeKey_1 });
    this.setState({ panes_1, activeKey_1 });
  }

  remove = (targetKey) => {
    let activeKey_1 = this.state.activeKey_1;
    let lastIndex;
    this.state.panes_1.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes_1 = this.state.panes_1.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKey_1 === targetKey) {
      activeKey_1 = panes_1[lastIndex].key;
    }
    this.setState({ panes_1, activeKey_1 });
  }
  render() {
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <Button onClick={this.add}>ADD</Button>
        </div>
        <Tabs
          hideAdd
          onChange={this.onChange}
          activeKey_1={this.state.activeKey_1}
          type="editable-card"
          onEdit={this.onEdit}
        >
          {this.state.panes_1.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
        </Tabs>
      </div>
    );
  }
}

export default Demo;

