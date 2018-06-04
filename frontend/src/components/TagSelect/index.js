import {Select, Spin, Menu, Dropdown, Icon, Input,Button} from 'antd'
import React from 'react'
import debounce from 'lodash/debounce'

const Option = Select.Option
const Search = Input.Search

class Index extends React.Component {
  constructor(props) {
    super(props)
  }

  state = {
    data: [],
    value: [],
    selectedTags:[],
    fetching: false,
    showDropDown: false,
  }
  fetchTags = (value) => {
    this.setState({data: [], fetching: true})
    this.props.getHotTag({
      payload: {
        searchQuery: value,
        objectType:this.props.type
      },
      onJson: (res) => {
        const data = res.map(i => ({
          number: i[1],
          tag: i[0],
        }))
        this.setState({
          data,
          fetching: false
        })
      },
    })

  }
  handleChange = (value) => {
    const selectedTags = value.map(i => (
      i.key
    ))
    this.setState({
      value,
      selectedTags,
      fetching: false,
    },()=>this.startSearch())
  }

  showDropDown = () => {
    this.setState({
      showDropDown: true,
    })
  }

  hideDropDown = () => {
    this.setState({
      showDropDown: false,
    })
  }

  searchChange = (e) =>{
    this.setState({
      searchText:e.target.value
    })
  }

  startSearch =() =>{
    this.props.onSearch(this.state.searchText,this.state.selectedTags)
  }

  render() {
    const {fetching, data, value} = this.state
    return (
      <div style={{display:'flex'}}>
        <div  onClick={this.showDropDown} >
          <Dropdown visible={this.state.showDropDown}
                    trigger={['click']}
                    onClick={this.showDropDown}
                    overlay={<Menu style={{width: '400px'}} >
                      {this.state.showDropDown && <Menu.Item key="0">
                         <Select
                          mode="multiple"
                          labelInValue
                          value={value}
                          placeholder="Search Tags..."
                          notFoundContent={fetching ?
                            <Spin size="small"/> : 'No result'}
                          filterOption={false}
                          onSearch={this.fetchTags}
                          onChange={this.handleChange}
                          style={{width: '100%'}}
                          autoFocus
                          onBlur={this.hideDropDown}
                        >
                          {data ? data.map(d => <Option
                              key={d.tag}>{d.tag}</Option>) :
                            <Option key={'disable'} disabled={true}>No
                              result</Option>}
                        </Select>
                      </Menu.Item>}
                    </Menu>}>
            <Button  style={{alignItems:'center',display:'flex'}}>
              {value.length>0?<p style={{marginBottom:'0'}}> &nbsp; {value.length} tag &nbsp;</p>:<p style={{marginBottom:'0'}}> &nbsp;Tags &nbsp;</p>}
              <Icon type={this.state.showDropDown?"caret-up":"caret-down"} style={{fontSize:'8px'}}/>
            </Button>
          </Dropdown>
        </div>
        <div style={{marginLeft:'20px'}}>
          <Search
            placeholder="input search text"
            onChange={(value)=>this.searchChange(value)}
            onSearch={this.startSearch}
            style={{width: 200}}
          />
        </div>
      </div>
    )
  }
}

export default Index
