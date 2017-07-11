(function () {
    'use strict';

    angular
        .module('app')
        .factory('pexels', pexels);

    pexels.$inject = ['$http', '$rootScope','APP_API_KEY','$cookies'];

    function pexels($http, $rootScope, APP_API_KEY, $cookies) {

        //Members
        var _results = [];
        var baseURI = 'http://api.pexels.com';
        var PEXELS_API_KEY = '563492ad6f9170000100000116ed76e3fd2b47bb574fb0174737aaf8';

        var service = {
            search: search,
        };

        
        return service;
        
        function search(query) {

            delete $http.defaults.headers.common['X-Dreamfactory-API-Key'];
            delete $http.defaults.headers.common['X-DreamFactory-Session-Token'];
            $http.defaults.headers.common['Authorization'] = PEXELS_API_KEY;

      //https://pexels.com/api/?key=5296312-7285c9a61e74685606fe28209&q=yellow+flowers&image_type=photo
            var url = baseURI + '/v1/search?query=' + query;

            return $http.get(url).then(function(result){

                _results = [];
                _results = result.data.photos;

                console.log("pexels results success! - ", result);
                
                delete $http.defaults.headers.common['Authorization'];
                $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                $http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.session_token;
                
                return _results;
            }, function (){
                delete $http.defaults.headers.common['Authorization'];
                $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                $http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.session_token;
                console.log("Problem getting pexels Images");
            });

        }
    }
})();