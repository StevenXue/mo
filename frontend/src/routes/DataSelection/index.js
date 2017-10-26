import React from 'react'
import { Select, Button, Input } from 'antd'
import { connect } from 'dva'
import styles from './index.less'

const Option = Select.Option;
const Search = Input.Search;

class DataSelection extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      ...props,
      privacy: 'owned_ds'
    }
  }

  handleChange = (value) => {
    this.setState({
      privacy: value
    })
  }

  handleClick = (value) => {
    this.props.dispatch({ type: 'upload/setDataSetID', payload: value})
    this.props.dispatch({ type: 'upload/show' })
    // console.log(value)

  }

  renderCards (key) {
    let dataSets = this.props.upload.dataSets[key];
    return dataSets.map((e, i) =>
      <div className={styles.mycard} key={e._id}
      >
        <div className={styles.content}>
          <div className={styles.title}>{e.name}</div>
          <div className={styles.desc}>{e.description}</div>
        </div>
        <div className={styles.buttons}>
          <Button onClick={() => {this.handleClick(e._id)}}>View</Button>
          <Button>Add to project</Button>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <div className={styles.selbar}>
          <Select defaultValue="owned_ds" className={styles.sel} onChange={this.handleChange}>
            <Option key="private" value="owned_ds">Private</Option>
            <Option key="public" value="public_ds">Public</Option>
          </Select>
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


export default connect(({ upload }) => ({ upload }))(DataSelection)
