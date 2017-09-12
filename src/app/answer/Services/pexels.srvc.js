(function () {
    'use strict';

    angular
        .module('app')
        .factory('pexels', pexels);

    pexels.$inject = ['$http', '$rootScope','APP_API_KEY','$cookies','SERVER_URL'];

    function pexels($http, $rootScope, APP_API_KEY, $cookies, SERVER_URL) {

        //Members
        var _results = [];
        var baseURI = 'http://api.pexels.com';
        var PEXELS_API_KEY = '563492ad6f9170000100000116ed76e3fd2b47bb574fb0174737aaf8';

        var service = {
            search: search,
            reqFromServer: reqFromServer,
        };

        
        return service;
        
        function search(query) {

            delete $http.defaults.headers.common['X-Dreamfactory-API-Key'];
            delete $http.defaults.headers.common['X-DreamFactory-Session-Token'];
            $http.defaults.headers.common['Authorization'] = PEXELS_API_KEY;

            console.log("$http.defaults ", $http.defaults);

      //https://pexels.com/api/?key=5296312-7285c9a61e74685606fe28209&q=yellow+flowers&image_type=photo
            var url = baseURI + '/v1/search?query=' + query;

            return $http.get(url).then(function(result){

                _results = [];
                _results = result.data.photos;

                if ($rootScope.DEBUG_MODE) console.log("pexels results success! - ", results);
                
                delete $http.defaults.headers.common['Authorization'];
                $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                $http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.session_token;
                
                return _results;
            }, function (){
                delete $http.defaults.headers.common['Authorization'];
                $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                $http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.session_token;
                if ($rootScope.DEBUG_MODE) console.log("Problem getting pexels Images");
            });

        }

        function reqFromServer(query){
            var data = {};
            data.query = query;

            var url = SERVER_URL + 'ImageServer/requestPexels';
            var req = {
                method: 'POST',
                data: data,
                url: url,
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                }
            }
            return $http(req);
        }
    }
})();