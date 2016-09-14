(function () {
    'use strict';

    angular
        .module('app')
        .service('fileupload', fileupload);

    fileupload.$inject = ['$http', '$cookies', 'APP_API_KEY'];

    function fileupload($http, $cookies, APP_API_KEY) {
        this.uploadFileToUrl = function (file, uploadUrl) {
            //var fd = new FormData();
            //fd.append('file', file);
            
            delete $http.defaults.headers.common['X-Dreamfactory-API-Key'];
            delete $http.defaults.headers.common['X-DreamFactory-Session-Token'];
            delete $http.defaults.headers.common['Accept'];
            delete $http.defaults.headers.common['Accept-Language'];
            delete $http.defaults.headers.common['Accept-Encoding'];
            delete $http.defaults.headers.common['Referer'];
            delete $http.defaults.headers.common['origin'];
            delete $http.defaults.headers.common['Connection'];
            
            var STORAGE_ACCESS_KEY = 'XvsnVKjNv25OVh37Z6UviHjw0DCfo0V5XTXpxqktR9PxHBw==';
            var url = 'https://rankx.file.core.windows.net/sandiego/est/'+file.name;
            var now = new Date().toUTCString(); 
            console.log("date in UTC format --- ", now);
                         
            var canonicalizedHeader = "x-ms-date:"+ now + "\nx-ms-version:2015-02-21";
            var canonicalizedResource = "/sandiego/est/"+file.name;
            
            /*
            var StringToSign = "PUT"+"\n"+
            "gzip, deflate, br\n"+  //Content-Encoding
            "en-US,en;q=0.5\n"+  //Content-Language
            file.size+"\n"+ //Content-Length
            "\n"+ //Content-MD5
            "multipart/form-data\n"+ //Content-Type
            now+"\n"+  //Date
            "\n\n\n\n\n"+canonicalizedHeader+"\n"+canonicalizedResource;*/
            
            var StringToSign = "PUT" + "\n" +
               "\n" +
               "multipart/form-data\n" +
               "\n" +
               canonicalizedHeader + 
               canonicalizedResource;
            
            /*StringToSign = VERB + "\n" +
               Content-Encoding + "\n" +
               Content-Language + "\n" +
               Content-Length + "\n" +
               Content-MD5 + "\n" +
               Content-Type + "\n" +
               Date + "\n" +
               If-Modified-Since + "\n" +
               If-Match + "\n" +
               If-None-Match + "\n" +
               If-Unmodified-Since + "\n" +
               Range + "\n" +
               CanonicalizedHeaders + 
               CanonicalizedResource;*/         
               console.log("StringToSign",StringToSign);
               
               //Decode to UTF8- Storage Access Key 
               var keyWords = CryptoJS.enc.Base64.parse(STORAGE_ACCESS_KEY); //Parse Key on Base64
               var keyUTF8 = CryptoJS.enc.Utf8.stringify(keyWords.words); //Encode Key to UTF8
                
               var StringToSignUTF8 = CryptoJS.enc.Utf8.parse(StringToSign);
               var hash = CryptoJS.HmacSHA256(StringToSignUTF8.sigBytes, keyUTF8);
               var signature = CryptoJS.enc.Base64.stringify(hash);
               
               console.log("signature---",signature);
            
            return $http.put(url, file,{
                headers: { 
                    'Content-Type': "multipart/form-data",
                    //'Content-Type':"application/json;charset=utf-8",
                    'x-ms-date': now,
                    'x-ms-version': '2015-02-21',
                    Authorization: 'SharedKey rankx:'+signature,
                     }
                
            })
                .success(function (result) {
                    //console.log("result", result);
                      console.log("Uploading file was succesful");
                      //$http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                })
                .error(function (error) {
                    //console.log("error", error)
                    console.log("There was a problem uploading your file");
                    //$http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                });
        }                
    }
})();