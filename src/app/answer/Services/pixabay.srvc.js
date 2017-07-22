(function () {
    'use strict';

    angular
        .module('app')
        .factory('pixabay', pixabay);

    pixabay.$inject = ['$http', '$rootScope','APP_API_KEY','$cookies'];

    function pixabay($http, $rootScope, APP_API_KEY, $cookies) {

        //Members
        var _results = [];
        var numRes = 10; //This is max number of results from google search
        var baseURI = 'https://pixabay.com/api/';
        var PIXABAY_API_KEY = '5296312-7285c9a61e74685606fe28209';

        var service = {
            search: search,
        };

        

        return service;
        
        function search(query) {

            delete $http.defaults.headers.common['X-Dreamfactory-API-Key'];
            delete $http.defaults.headers.common['X-DreamFactory-Session-Token'];

      //https://pixabay.com/api/?key=5296312-7285c9a61e74685606fe28209&q=yellow+flowers&image_type=photo
            var url = baseURI + '?key=' + PIXABAY_API_KEY + '&q=' + query + '&image_type=photo';

            return $http.get(url).then(function(result){

                _results = [];
                _results = result.data.hits;

                if ($rootScope.DEBUG_MODE) console.log("pixabay results success! - ", result);
                
                $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                $http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.session_token;
                return _results;
            }, function (){
                
                $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
                $http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.session_token;
                if ($rootScope.DEBUG_MODE) console.log("Problem getting Pixabay Images");
            });

        }
    }
})();