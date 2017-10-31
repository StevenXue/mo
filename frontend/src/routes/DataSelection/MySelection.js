import React from 'react'
import { Select, Button, Input, Card, Pagination, Tag, Icon, Spin } from 'antd'
import { connect } from 'dva'
import styles from './index.less'
import { dataCategory } from '../../constants'

const Option = Select.Option;
const Search = Input.Search;

class MySelection extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      ...props,
      privacy: 'owned_ds',
      category: 'allcategory',
    }
  }

  handleChangePrv = (value) => {
    console.log(this.props)
    this.setState({
      privacy: value
    })
  }

  handleChangeCat = (value) => {
    // console.log(this.props)
    this.setState({
      category: value
    })
  }

  handleView = (oid, name, desc, tags) => {
    this.props.dispatch({ type: 'upload/setDataSetID', payload: oid})
    this.props.dispatch({ type: 'upload/setDataSetName', payload: name})
    this.props.dispatch({ type: 'upload/setDataSetDesc', payload: desc})
    this.props.dispatch({ type: 'upload/setDataSetTags', payload: tags})
    this.props.dispatch({ type: 'upload/show' })
    // console.log(value)
  }

  handleAdd = (oid, name, desc, tags) => {
    this.props.dispatch({ type: 'upload/setDataSetID', payload: oid})
    this.props.dispatch({ type: 'upload/setDataSetName', payload: name})
    this.props.dispatch({ type: 'upload/setDataSetDesc', payload: desc})
    this.props.dispatch({ type: 'upload/setDataSetTags', payload: tags})
    this.props.dispatch({ type: 'upload/stage' })
  }

  handleNew = () => {
    const { history, match } = this.props
    console.log(history)
    console.log(match)
    history.push(`/workspace/${match.params.projectID}/import`)
  }

  renderCards (privacy, category) {
    let dataSets
    if (!this.props.isStaged) {
      dataSets = this.props.upload.dataSets[privacy]
    } else {
      dataSets = this.props.upload.stagingDataSet
    }

    if (category !== 'allcategory') {
      dataSets = dataSets.filter(
        (el) => el.related_field === category
      )
    }


    return dataSets.map((e) =>
      <div className={styles.mycard} key={e._id}
      >
        <div className={styles.content}>
          <div className={styles.title}>{e.name}</div>
          <div className={styles.desc}>{e.description}</div>
          {e.tags.length > 0 ?
            <div className={styles.tagzone}>
              {e.tags.map((tag) => <Tag key={tag} color="#C1E4F6">
                <span className={styles.tag}>{tag}</span></Tag>)}
            </div>:null }
        </div>

        {!this.props.isStaged?<div className={styles.buttons}>
          <Button size="large" className={styles.top} loading={this.props.upload.viewLoading}
                  onClick={() => {this.handleView(e._id, e.name, e.description, e.tags)}} >
            <Icon type="eye"/>View</Button>
          <Button size="large" className={styles.bottom} loading={this.props.upload.addLoading}
                  onClick={() => {this.handleAdd(e._id, e.name, e.description, e.tags)}} >
            Add to project</Button>
        </div>:null}
      </div>

    );

  }


  render() {
    return (
      <div className={styles.whole}>
        <div className={styles.selbar}>
          {!this.props.isStaged?<Select defaultValue="owned_ds" className={styles.sel} onChange={this.handleChangePrv}>
            <Option key="private" value="owned_ds">Private</Option>
            <Option key="public" value="public_ds">Public</Option>
          </Select>:null}

          <Select defaultValue="alltypes" className={styles.sel}>
            <Option key="alltypes" value="alltypes">All types</Option>
            <Option key="others" value="others">others</Option>
          </Select>
          <Select defaultValue="allcategory" className={styles.sel} onChange={this.handleChangeCat}>
            <Option key="allcategory" value="allcategory">All Category</Option>
            {dataCategory.map((e) => <Option key={e} value={e}>{e}</Option>)}
          </Select>
          <div className={styles.center}>
          </div>
          <Search placeholder='Search' className={styles.searchbar}/>
          {this.props.isStaged?<Button
            onClick={() => {this.handleNew()}}
            type="primary"
          ><Icon type="plus-circle-o"/>New Dataset</Button>:null}
        </div>
        {this.props.upload.dataSetsLoading?<Spin />:
          this.renderCards(this.state.privacy, this.state.category)}

        {/*<div className={styles.page}>*/}
          {/*<Pagination defaultCurrent={1} total={50}/>*/}
        {/*</div>*/}

      </div>
    )

  }
}


export default connect(({ upload }) => ({ upload }))(MySelection)
