var express = require('express');
var nunjucks = require('nunjucks');

var app = express();
var port = process.env.PORT || 3000;

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

require('./routes')(app);

app.listen(port);
console.log('Listening on http://localhost:' + port);
