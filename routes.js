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
        if (messaging.isTwilioRequest(req)) {
            var teamName = req.body.Body || null;
            db.child('teams').once('value', function(snapshot) {
                if (messaging.isValidRequest(req) &&
                        snapshot.hasChild(teamName)) {
                    // The team voted for exists in the database.

                    // We store the vote by phone number. This ensures that
                    // everyone only gets a single vote, but it allows voters
                    // to change their vote after casting it.
                    var voteData = {};
                    voteData[req.body.From] = req.body.Body;
                    db.child('votes').update(voteData);

                    res.send(messaging.createSmsResponse(
                        'Your vote for ' + teamName + ' has been recorded.'));
                } else {
                    // The user supplied an invalid team name.
                    res.send(messaging.createSmsResponse(
                        '"' + teamName + '" is not a valid team. ' +
                        'Check your spelling.'));
                }
            });
        } else {
            res.status(403).send('Forbidden');
        }
    });

    app.use("/public", express.static(path.join(__dirname, 'public')));
};
