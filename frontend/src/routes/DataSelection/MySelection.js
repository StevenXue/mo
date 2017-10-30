import React from 'react'
import { Select, Button, Input } from 'antd'
import { connect } from 'dva'
import styles from './index.less'

const Option = Select.Option;
const Search = Input.Search;

class MySelection extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      ...props,
      privacy: 'owned_ds'
    }
  }

  handleChange = (value) => {
    console.log(this.props)
    this.setState({
      privacy: value
    })
  }

  handleView = (oid, name, desc) => {
    this.props.dispatch({ type: 'upload/setDataSetID', payload: oid})
    this.props.dispatch({ type: 'upload/setDataSetName', payload: name})
    this.props.dispatch({ type: 'upload/setDataSetDesc', payload: desc})
    this.props.dispatch({ type: 'upload/show' })
    // console.log(value)

  }

  handleAdd = (oid, name, desc) => {
    this.props.dispatch({ type: 'upload/setDataSetID', payload: oid})
    this.props.dispatch({ type: 'upload/setDataSetName', payload: name})
    this.props.dispatch({ type: 'upload/setDataSetDesc', payload: desc})
    this.props.dispatch({ type: 'upload/stage' })
  }

  renderCards (key) {
    let dataSets
    if (!this.props.isStaged) {
      dataSets = this.props.upload.dataSets[key]
    } else {
      dataSets = this.props.upload.stagingDataSet
    }

    return dataSets.map((e, i) =>
      <div className={styles.mycard} key={e._id}
      >
        <div className={styles.content}>
          <div className={styles.title}>{e.name}</div>
          <div className={styles.desc}>{e.description}</div>
        </div>
        {!this.props.isStaged?<div className={styles.buttons}>
          <Button onClick={() => {this.handleView(e._id, e.name, e.description)}}>View</Button>
          <Button onClick={() => {this.handleAdd(e._id, e.name, e.description)}}>Add to project</Button>
        </div>:null}

      </div>
    );
  }

  render() {
    return (
      <div>
        <div className={styles.selbar}>
          {!this.props.isStaged?<Select defaultValue="owned_ds" className={styles.sel} onChange={this.handleChange}>
            <Option key="private" value="owned_ds">Private</Option>
            <Option key="public" value="public_ds">Public</Option>
          </Select>:null}

          <Select defaultValue="alltypes" className={styles.sel}>
            <Option key="alltypes" value="alltypes">All types</Option>
            <Option key="others" value="others">others</Option>
          </Select>
          <Select defaultValue="allcategory" className={styles.sel}>
            <Option key="allcategory" value="allcategory">All Category</Option>
            <Option key="others" value="others">others</Option>
          </Select>
          <div className={styles.center}>
          </div>

          <Search placeholder='Search' className={styles.searchbar}/>
        </div>
        {this.renderCards(this.state.privacy)}
      </div>
    )
  }
}


export default connect(({ upload }) => ({ upload }))(MySelection)
