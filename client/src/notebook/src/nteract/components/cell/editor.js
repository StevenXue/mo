import React from 'react';
import ReactDOM from 'react-dom';

import CodeMirror from 'react-code-mirror';

import { updateCellSource } from '../../../actions';

import './codemirror.css';

export default class Editor extends React.Component {
  static propTypes = {
    id: React.PropTypes.string,
    input: React.PropTypes.any,
    language: React.PropTypes.string,
    lineNumbers: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    theme: React.PropTypes.string,
    forceSource: React.PropTypes.string,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  static defaultProps = {
    language: 'python',
    lineNumbers: false,
    text: '',
    theme: 'composition',
  };

  constructor(props) {
    super(props);
    this.state = {
      source: this.props.input,
      forceSource: ''
    };

    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    const editor = ReactDOM.findDOMNode(this.refs.codemirror);
    editor.addEventListener('keypress', (e) => {
      if (e.keyCode === 13 && e.shiftKey) {
        e.preventDefault();
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    // if (this.props.forceSource !== nextProps.forceSource) {
    //   // console.log(nextProps.forceSource);
    //   this.setState({
    //     source: nextProps.forceSource,
    //   });
    //   this.context.dispatch(updateCellSource(this.props.id, nextProps.forceSource));
    // } else {
    //   // console.log("dont change");
    //
    // }
    this.setState({
      source: nextProps.input,
      forceSource: nextProps.forceSource
    });
  }

  onChange(e) {
    console.log(e.target.value);
    if (this.props.onChange) {
      console.log('on change?');
      this.props.onChange(e.target.value);
    } else {
      this.setState({
        source: e.target.value,
      });
      this.context.dispatch(updateCellSource(this.props.id, e.target.value));
    }
    // console.log(e.target.value, this.state.source);
  }

  // onClickButton() {
  //   this.setState({
  //     source: this.state.forceSource
  //   });
  //   this.context.dispatch(updateCellSource(this.props.id, this.state.forceSource));
  //   console.log("clicked");
  // }

  render() {
    return (
      <div className="cell_editor" >
          <CodeMirror
            value={this.state.source}
            ref="codemirror"
            className="cell_cm"
            mode={this.props.language}
            textAreaClassName={['editor']}
            textAreaStyle={{
              minHeight: '10em',
              backgroundColor: 'red',
            }}
            lineNumbers={this.props.lineNumbers}
            theme={this.props.theme}
            onChange={this.onChange}
          />

      </div>
    );
  }
}
