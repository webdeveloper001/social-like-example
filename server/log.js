
var fs = require('fs');

module.exports = function(message) {
    filepath = 'log/log.txt';

    var today = new Date();
    var UTCstring = today.toUTCString();
    // Mon, 03 Jul 2006 21:44:38 GMT

    message = '\n---------------------------------' + '\n' + UTCstring + '::' + message;
    // var message = "";
    // message = '\nData to append';
    fs.appendFile(filepath, message, (err) => {
        if (err) throw err;
    });
}
