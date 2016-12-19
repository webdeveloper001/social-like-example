console.log("@uploadImages");

var azure = require('azure-storage');
var blobSvc = azure.createBlobService('rankx', 'PrnitxLed+IWZzITtd+seNgtFrsjfnHaTKvuUNVpfjtw6NAPnnJVIYtxVsc7z8miCT16kHSNdsnQMtH06DB+Rw==');

var fs = require('fs'),
  request = require('request');

var fext = '';

// Read Synchrously
console.log("\n *START* \n");
var content = fs.readFileSync("images.json");
//console.log("Output Content : \n" + content);
var images = JSON.parse(content);
console.log("images.length - ", images.length);
console.log("\n *EXIT* \n");

for (var i = 0; i < images.length; i++) {
  
  if (images[i].url.indexOf('jpg') > -1) fext = 'jpg';
  if (images[i].url.indexOf('png') > -1) fext = 'png';
  if (images[i].url.indexOf('jpeg') > -1) fext = 'jpeg';

  blobSvc.createBlockBlobFromLocalFile('sandiego',
    images[i].answer + "/" + images[i].id + '.' + fext, 'imagesTempDir/'+ images[i].id + '.' + fext, function (error, result, response) {
      if (!error) {
        console.log("File uploaded!");
      }
      else console.log("Error - ", error);
    });
  
  /*//This code deletes the blobs  
  blobSvc.deleteBlob('sandiego', images[i].answer + "/" + images[0].id + '.' + fext, function(error, response){
    if(!error){
      console.log("Blob was deleted");
    }
  });*/  

}
	
  