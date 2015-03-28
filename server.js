var express = require('express');
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');

var app = express();
var port = process.env.PORT || 3000;

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));

require('./routes')(app);

app.listen(port);
console.log('Listening on http://localhost:' + port);
