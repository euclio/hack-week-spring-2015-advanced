var crypto = require('crypto');

var twilio = require('twilio');

var config = require('./config');

var AUTH_TOKEN = config.get('TWILIO_AUTH_TOKEN');
var client = twilio(config.get('TWILIO_ACCOUNT_SID'), AUTH_TOKEN);

exports.isTwilioRequest = function(req) {
    return twilio.validateExpressRequest(req, AUTH_TOKEN);
};

exports.isValidRequest = function(req) {
    // Let's make sure that the body contains a valid firebase node name.
    var isValidFirebaseNode = req.body.Body &&
        !/[.$#\[\]\/\x00-\x1F\x7F]/.test(req.body.Body);
    return isValidFirebaseNode;
};

exports.createSmsResponse = function(body) {
    var response = new twilio.TwimlResponse();
    response.sms(body);
    return response.toString();
};

exports.webhook = twilio.webhook({
    url: config.get('TWILIO_CALLBACK')
});
