var db = require('./database');
var config = require('./config');
var express = require('express');
var path = require('path');
var messaging = require('./messaging');

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.render('index.html', {
            phoneNumber: config.get('TWILIO_PHONE_NUMBER')
        });
    });

    app.post('/vote', function(req, res) {
        var isValid = messaging.isValidRequest(req);
        console.log(isValid);
        if (isValid) {
            // Store the vote by phone number. This ensures that everyone gets
            // a single vote, but people may change their vote.
            var voteData = {};
            voteData[req.body.From] = req.body.Body;
            db.child('votes').update(voteData);
            res.send('Valid Request');
        } else {
            res.status(403).send('Forbidden');
        }
    });

    app.use("/public", express.static(path.join(__dirname, 'public')));
};
