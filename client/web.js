const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('./dist'));
// app.use(express.static('./assets'));


app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, './dist', 'stats.html'));
});

app.listen(3090, "0.0.0.0");
