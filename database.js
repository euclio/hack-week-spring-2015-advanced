var config = require('./config');

var Firebase = require('firebase');
var firebase = new Firebase(config.get('FIREBASE_URL'));
firebase.authWithCustomToken(config.get('FIREBASE_SECRET'), function(err) {
    if (err) {
        throw new Error('Login to firebase failed.');
    } else {
        console.log('Successfully logged into firebase.');
    }
});

module.exports = firebase;
