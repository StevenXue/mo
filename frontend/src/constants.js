const mainColor = '#108ee9'

import config from '../config.js'

module.exports = {
  apiPrefix: '/pyapi',

  ...config,

  mainColor,

  stepStyle: {
    mainColor,
    beacon: {
      inner: mainColor,
      outer: mainColor,
    },
  },

  statusColor: {
    Running: '#108ee9',
    Completed: '#00a854',
    Terminated: '#f04134',
  },

  privacyChoices: [
    { value: 'all', text: 'Privacy' },
    { value: 'private', text: 'Private' },
    { value: 'public', text: 'Public' },
  ],

  projectChoices: [
    { value: 'project', text: 'Project Type' },
    { value: 'app', text: 'App' },
    { value: 'module', text: 'Module' },
    { value: 'dataset', text: 'Dataset' },
  ],

  dataCategory: [
    'Business', 'Government', 'Education', 'Environment',
    'Health', 'Housing & Development', 'Public Services',
    'Social', 'Transportation', 'Science', 'Technology',
  ],

  translateDict: {
    'dataAnalysis': 'toolkit',
    'modelling': 'model',
  },

  tempVariable: {
    // nameOrId: '_id',
    nameOrId: 'name',
  },

  statusDict: {
    0: 'ready',
    100: 'running',
    200: 'done',
    300: 'error',
  },

  defaultOverviewDocs: '## Overview\n' +
    '\n' +
    '_Provide a short overview of your algorithm that explains the value and primary use cases._\n' +
    '\n' +
    '## Usage\n' +
    '\n' +
    '### Input\n' +
    '\n' +
    '_Describe the input fields for your algorithm. For example:_\n' +
    '\n' +
    '\n' +
    '| Parameter | Description |\n' +
    '| --------- | ----------- |\n' +
    '| field     | Description of field |\n' +
    '\n' +
    '### Output\n' +
    '\n' +
    '_Describe the output fields for your algorithm. For example:_\n' +
    '\n' +
    '\n' +
    '| Parameter | Description | \n' +
    '| --------- | ----------- | \n' +
    '| field     | Description of field | \n' +
    '\n' +
    '## Examples\n' +
    '\n' +
    '_Provide and explain examples of input and output for your algorithm._\n' +
    '\n',
}

