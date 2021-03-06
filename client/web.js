const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('./dist'));
// static folder for media
app.use(express.static('./assets'));


app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, './dist', 'index.html'));
});

app.listen(8008, "0.0.0.0");
