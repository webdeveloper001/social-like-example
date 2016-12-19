console.log("@downloadImages");

    var fext = '';
    var err_urls = [];
    
    var fs = require('fs'),
    request = require('request');
    
    // Read Synchrously
    console.log("\n *START* \n");
    var content = fs.readFileSync("images.json");
    //console.log("Output Content : \n" + content);
    var images = JSON.parse(content);
    console.log("images.length - ",images.length);
    console.log("\n *EXIT* \n");
    
    var download = function (uri, filename, callback) {
        
        request.head(uri, function (err, res, body) {
            //console.log("url - ", uri);
            //console.log("res - ", res);
            if (res != undefined){
                console.log('content-type:', res.headers['content-type']);
                console.log('content-length:', res.headers['content-length']);
                request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
            }
            else err_urls.push(uri);
        });
    };    
    
    for (var i=0; i < images.length; i++){              //images.length
        //console.log(images[i]);
        if (images[i].url.indexOf('jpg') > -1) fext = 'jpg';
        if (images[i].url.indexOf('png') > -1) fext = 'png';
        if (images[i].url.indexOf('jpeg') > -1) fext = 'jpeg';
        
        try {
            //console.log("index - ",images[i].id);
            download(images[i].url,
                'imagesTempDir/'+ images[i].id + '.' + fext, function () {
                    console.log('done');
                });
            }
        catch (err){
           err_urls.push(images[i].url); 
        }
    }
    //console.log("Error Urls !!!! - ", err_urls);

    
    /*
    function readTextFile(file, callback) {
        var rawFile = new XMLHttpRequest();
            rawFile.overrideMimeType("application/json");
            rawFile.open("GET", file, true);
            rawFile.onreadystatechange = function() {
                if (rawFile.readyState === 4 && rawFile.status == "200") {
                    callback(rawFile.responseText);
                }
            }
            rawFile.send(null);
        }

        //usage:
        readTextFile("/images.json", function(text){
            var data = JSON.parse(text);
            console.log(data);
        });
/*    
download('http://blog.lapensionehotel.com/wp-content/uploads/2015/01/Screen-Shot-2015-01-14-at-1.33.03-PM.png',
 'Screen-Shot-2015-01-14-at-1.33.03-PM.png', function () {
    console.log('done');
});*/