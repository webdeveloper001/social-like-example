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

            //console.log("file", file);
            var baseUri = '/api/v2/files/images/' + file.name;
            return $http.post(baseUri, file, {
                headers: { 
                    'Content-Type': "multipart/form-data"
                     }
            })
                .success(function (result) {
                    //console.log("result", result);
                      console.log("Uploading file was succesful");
                })
                .error(function (error) {
                    //console.log("error", error)
                    console.log("There was a problem uploading your file");
                });
        }
    }
})();