(function () {
    'use strict';

    angular
        .module('app')
        .factory('imagelist', imagelist);

    imagelist.$inject = ['$http', '$rootScope'];

    function imagelist($http, $rootScope) {

        var service = {
            getImageList: getImageList            
        };

        return service;
        
        function getImageList() {
            
            var storageurl = "https://rankx.blob.core.windows.net/sandiego?restype=container&comp=list"+"sv=2015-04-05&ss=bfqt&srt=sco&sp=rwdlacup&se=2018-08-30T01:15:12Z&st=2016-08-29T17:15:12Z&spr=https,http&sig=PpyWE0X%2Fpz9SuRje5GtHh44WaWIii0GBU9PbIcDIka8%3D";
            return $http.get(storageurl);
        
            //return imageQuery.then(querySucceeded, queryFailed);
            function querySucceeded(result) {
                console.log('query succeded');

            }
            function queryFailed(result) {

                console.log('image query failed');
            }
        

        }
    }
})();

