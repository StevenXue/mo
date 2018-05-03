import dva from 'dva'
import '../node_modules/highlight.js/styles/mono-blue.css'
import './global.less'
import './index.less'
// import modelling from './models/modelling'
import projectDetail from './models/projectDetail'
import worldChannel from './models/worldChannel'
import chatbot from './models/chatbot'

// ES6 Promise polyfill
require('es6-promise/auto')

// 1. Initialize
const app = dva({
  onError(e) {
    console.log("error", e)
    e.preventDefault()
  }
})

app.model(require('./models/project'))
app.model(require('./models/login'))
app.model(require('./models/register'))
// app.model(require('./models/allRequest'))
app.model(require('./models/message'))
// app.model(require('./models/profile'))
app.model(require('./models/launchpage'))

// app.model(modelling)
app.model(projectDetail)
app.model(worldChannel)
app.model(chatbot)

// 通过dva g model test的，手动将这个models/test.js文件删除掉，会报错。
// rm -r node_modules/.cache/babel-loader

// 2. Plugins
// app.use({});

// 3. Model
// app.model(require('./models/example'));

// 4. Router
app.router(require('./router'))

// 5. Start
app.start('#root')
