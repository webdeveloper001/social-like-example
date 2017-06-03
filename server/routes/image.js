
var azure = require('azure-storage');
var blobSvc = azure.createBlobService('rankx', process.env.AZURE_KEY);

var log = require('../log');
var helpers = require('../helpers');

// ------ Image Download and Upload ----- 
// This code can be moved to a different file with a library, but temporarily here for testing.

function saveImage(req, res, next) {
    log("------->>   Received ImageServer / Save Image Request--------");

    var imageurl = req.body.imageurl;
    var filename = req.body.filename;
    var rank = req.body.rank;

    var fext = '';

    if (imageurl.indexOf('jpg') > -1) fext = 'jpg';
    if (imageurl.indexOf('png') > -1) fext = 'png';
    if (imageurl.indexOf('jpeg') > -1) fext = 'jpeg';

    try {
        //console.log("index - ",images[i].id);
        download(imageurl,
            'imagesTempDir/' + filename + '.' + fext,
            function() {
                log("image " + filename + "download done");
                //after image is done downloading, upload to Azure Storage Account
                blobSvc.createBlockBlobFromLocalFile('sandiego',
                    "featuredImages/" + filename + '.' + fext,
                    'imagesTempDir/' + filename + '.' + fext,
                    function(error, result, response) {
                        if (!error) {
                            log("image " + filename + "uploaded Succesfully");
                            //after upload succesful
                            helpers.updateImageUrlDreamFactory(rank, filename + '.' + fext);
                        } else {
                            log("Error uploading image " + filename + " error: " + error);
                            res.send(500, "Error uploading image " + filename + " error: " + error);
                        }
                    });

            });
    } catch (err) {
        log("error downloading image " + filename);
        res.send(500, "error downloading image " + filename);
    }

    log("<<-------   end Save Image-------------");


}
var download = function(uri, filename, callback) {

    request.head(uri, function(err, res, body) {
        //console.log("url - ", uri);
        //console.log("res - ", res);
        if (res != undefined) {
            console.log('content-type:', res.headers['content-type']);
            console.log('content-length:', res.headers['content-length']);
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        } else log("error downloading image " + filename);
    });
};

module.exports= {
    saveImage: saveImage
}