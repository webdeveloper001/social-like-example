
var azure = require('azure-storage');
var blobSvc = azure.createBlobService('rankx', process.env.AZURE_KEY);

var log = require('../log');
var helpers = require('../helpers');

var fs = require('fs'),
  request = require('request');

// ------ Image Download and Upload ----- 
// This code can be moved to a different file with a library, but temporarily here for testing.

function saveImage(req, res, next) {
    log("------->>   Received ImageServer / Save Image Request--------");

    var imageurl = req.body.imageurl;
    var filename = req.body.filename;
    var category = req.body.category;

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
                            helpers.updateImageUrlDreamFactory(category, filename + '.' + fext);
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

function requestPexels(req, res, next) {
    
var _results = [];
var baseURI = 'api.pexels.com';
var PEXELS_API_KEY = '563492ad6f9170000100000116ed76e3fd2b47bb574fb0174737aaf8';


var options = {
  url: 'http://api.pexels.com/v1/search?query=' + req.body.query,
  headers: {
    'Authorization': PEXELS_API_KEY
  }
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    res.status(200).send(body);
  }
  else{
      res.status(500).send("error getting pexels image - " + error);
  }
}

request(options, callback);    

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
    saveImage: saveImage,
    requestPexels: requestPexels
}