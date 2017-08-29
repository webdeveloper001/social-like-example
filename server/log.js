
var fs = require('fs');

module.exports = function(message) {
    //filepath = 'log/log.txt';

    var today = new Date();
    var UTCstring = today.toUTCString();
    // Mon, 03 Jul 2006 21:44:38 GMT
    var Y = today.getFullYear();
    var M = today.getMonth();
    var D = today.getDate();

    if (M < 10) M = '0' + M;
    if (D < 10) D = '0' + D;

    var logfilename = '' + Y + M + D + '.txt';

    const targetFolder = './log/';
    var files = [];

    fs.readdirSync(targetFolder).forEach(file => {
        files.push(file);
    });

    if (files.indexOf(logfilename) >-1 ) {
        filepath = 'log/' + logfilename;
        logMessage(message, filepath);
    }
    else {
        fs.open(logfilename, 'w', function (err, file) {
        if (err) throw err;
        filepath = 'log/' + logfilename;
        logMessage(message, filepath);
        }); 
    }
    //filepath = 'log/log.txt';
}

function logMessage(message, filepath){
    //message = '\n---------------------------------' + '\n' + UTCstring + '::' + message;
    // var message = "";
    // message = '\nData to append';
    fs.appendFile(filepath, message, (err) => {
        if (err) throw err;
    });
}
