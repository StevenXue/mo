const express = require('express');
const path = require('path');
const proxy = require('express-http-proxy');
const app = express();

const flaskUrl = 'http://localhost:5005';
const hubUrl = 'http://localhost:8000';

app.use(express.static('./dist'));
// static folder for mediaosos
app.use(express.static('./assets'));

app.use('/pyapi', proxy(flaskUrl, {
  proxyReqPathResolver: function(req) {
    return require('url').parse(req.url).path;
  }
}));
app.use('/hub_api', proxy(hubUrl, {
  proxyReqPathResolver: function(req) {
    return require('url').parse(req.url).path;
  }
}));

app.use('/api', function (req, res) {
  var url = 'http://122.224.116.44:5005' + req.url;
  req.pipe(request(url)).pipe(res);
});

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, './dist', 'index.html'));
});

app.listen(8989, "0.0.0.0");
