import dva from 'dva';
import '../node_modules/highlight.js/styles/mono-blue.css'
import './global.less';
import './index.less';

// 1. Initialize
const app = dva();

app.model(require("./models/dataAnalysis"));
app.model(require("./models/modelling"));
app.model(require("./models/projectDetail"));
app.model(require("./models/project"));
app.model(require("./models/login"));
app.model(require("./models/register"));
app.model(require("./models/upload"));
app.model(require("./models/preview"));
app.model(require("./models/deployment"));
app.model(require("./models/history"));
app.model(require("./models/deployedmodels"));
app.model(require("./models/mymodels"));
// 2. Plugins
// app.use({});

// 3. Model
// app.model(require('./models/example'));

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');
