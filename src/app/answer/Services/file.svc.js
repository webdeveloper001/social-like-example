(function () {
    'use strict';

    angular
        .module('app')
        .factory('file', file);

    file.$inject = ['$http', 'APP_API_KEY'];

    function file($http, APP_API_KEY) {

        // Members
        var baseUri = '/api/v2/files/images';

        var service = {
            uploadFile: uploadFile,
            getFile: getFile
        };

        return service;

        function uploadFile(myFile) {

            console.log("file", myFile);
            var url = baseUri + '/' + myFile.name;

            return $http.post(url, myFile, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                if ($rootScope.DEBUG_MODE) console.log("result", result);
                return result.data;
            }
        }

        function getFile(fileName) {
            var url = baseUri + '/' + encodeURIComponent(fileName);

            return $http.get(url, {
                params: {
                    "api_key": APP_API_KEY
                }
            }).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                
                return result.data;
            }
        }

        function _queryFailed(error) {

            console.log("Error: ", error)
            throw error;
        }
    }
})();