import dva from 'dva';
import './global.less';
import './index.less';

// 1. Initialize
const app = dva();

// app.model(require("./models/workBench"));
app.model(require("./models/dataAnalysis"));
app.model(require("./models/modelling"));
app.model(require("./models/projectDetail"));
app.model(require("./models/project"));
app.model(require("./models/login"));

// 2. Plugins
// app.use({});

// 3. Model
// app.model(require('./models/example'));

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');
