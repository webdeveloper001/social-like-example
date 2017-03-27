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
        };

        return service;

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