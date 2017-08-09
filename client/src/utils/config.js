import CONSTANT from '../constants'

module.exports = {
  name: "Golder's Green",
  prefix: 'antdAdmin',
  footerText: "Golder's Green Datalab  © 2017",
  logo: '/logo.png',
  iconFontCSS: '/iconfont.css',
  iconFontJS: '/iconfont.js',
  baseURL: 'http://localhost:8000/api/v1',
  YQL: ['http://www.zuimeitianqi.com'],
  CORS: [CONSTANT.flaskServer],
  openPages: ['/login'],
  apiPrefix: '/api/v1',
  jupyterServer: CONSTANT.jupyterServer,
  api: {
    userLogin: '/user/login',
    refreshToken: '/refresh_token',
    userLogout: '/user/logout',
    userInfo: '/userInfo',
    users: '/users',
    user: '/user/:id',
    dashboard: '/dashboard',
    files: '/file/files',
    // fileList: '/file/list_files_by_user_ID',
    // dataImport: '/data/import_data_from_file_id',
    dataSets: '/data/data_sets',
    projects: '/project/projects',
    publish: '/project/publish',
    fork : '/project/fork',
    // projectCreate: '/project/create_project',
    getDataFields: '/data/data_sets/fields'
  },
}
