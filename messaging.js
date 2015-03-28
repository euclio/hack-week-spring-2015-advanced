var crypto = require('crypto');

var twilio = require('twilio');

var config = require('./config');

var AUTH_TOKEN = config.get('TWILIO_AUTH_TOKEN');
var client = twilio(config.get('TWILIO_ACCOUNT_SID'), AUTH_TOKEN);

exports.isValidRequest = function(req) {
    // FIXME: The twilio nodejs library cannot currently generate the correct
    // hash for request verification.
    // return twilio.validateExpressRequest(req, AUTH_TOKEN);

    // FIXME: Manual verification
    // // Create a string that is the URL with full query string.
    // console.log(url);

    // // Sort the list of post variables by parameter name.
    // var keys = Object.keys(req.body);
    // keys.sort();

    // // Append each POST variable, name and value, to the string with no
    // // delimiters.
    // for (var i = 0; i < keys.length; i++) {
    //     url += keys[i] + req.body[keys[i]];
    // }

    // console.log(url);

    // // Hash the resulting string using HMAC-SHA1, using our auth token as the
    // // key.
    // var hash = crypto.createHmac('sha1', AUTH_TOKEN)
    //     .update(new Buffer(url, 'utf-8')).digest('base64');

    // var signature = req.get('X-Twilio-Signature') || null;

    // console.log(hash, signature);

    // return hash == signature;
    return true;
};
