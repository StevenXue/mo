import * as React from 'react'
import * as ReactDOM from 'react-dom';

// import { connect } from 'dva'


/**
 * The output placeholder class.
 */
class IndexPage extends React.Component {

  /**
   * Render the output placeholder using the virtual DOM.
   */
  render() {
    return (
      <div style={{height: 100}}>
        <h1>Yay! Welcome to dva!!!</h1>
      </div>
    );
  }

}

// const c = connect()(IndexPage)

export default function renderReact(node) {
  ReactDOM.render(<IndexPage/>, node);
}
