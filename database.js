var config = require('./config');

var Firebase = require('firebase');
var firebase = new Firebase(config.get('FIREBASE_URL'));

module.exports = firebase;
