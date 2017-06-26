(function () {
    'use strict';

    angular
        .module('app')
        .factory('categorycode', categorycode);

    categorycode.$inject = ['$http', '$q', '$rootScope'];

    function categorycode($http, $q, $rootScope) {

        // Members
        var _categorycodes = [];
        var baseURI = '/api/v2/mysql/_table/categorycode';

        var service = {
            get: get,
            post:post,
        };

        return service;

        function post(item){
            
            var url = baseURI;
            var resource = [];

            resource.push(item);

            //update local copy
            _categorycodes.push(item);
            
            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _categorycodeFailed);

            function querySucceeded(result) {
                if ($rootScope.DEBUG_MODE) console.log("created new category-code paire");
                return result.data;
            }
        }

        function get(forceRefresh) {
            
            if (_areQueriesLoaded() && !forceRefresh) {

                return $q.when(_categorycodes);
            }

            var url = baseURI;

            return $http.get(url).then(categorycodeSucceeded, _categorycodeFailed);

            function categorycodeSucceeded(result) {

                return _categorycodes = result.data.resource;
            }

        }
        
        
        function _areQueriesLoaded() {

            return _categorycodes.length > 0;
        }

        function _categorycodeFailed(error) {

            throw error;
        }
    }
})();