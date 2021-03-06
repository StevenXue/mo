import './index.html'
import '../node_modules/react-joyride/lib/react-joyride-compiled.css'
import '../node_modules/highlight.js/styles/mono-blue.css'
// import '../node_modules/highlight.js/styles/codepen-embed.css'
import './index.css'
import 'babel-polyfill'
import dva from 'dva'
import createLoading from 'dva-loading'
import { browserHistory } from 'dva/router'
import { message } from 'antd'

// 1. Initialize
const app = dva({
  ...createLoading({
    effects: true,
  }),
  history: browserHistory,
  onError (error) {
    message.error(error.message)
  },
})

// 2. Model
app.model(require('./models/app'));

// 3. Router
app.router(require('./router'))

// 4. Start
app.start('#root')
