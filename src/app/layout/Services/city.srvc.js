(function () {
    'use strict';

    angular
        .module('app')
        .factory('city', city);

    city.$inject = ['$http', '$q', '$rootScope'];

    function city($http, $q, $rootScope) {

        // Members
        var _cities = [];
        var baseURI = '/api/v2/mysql/_table/cities';

        var service = {
            getCities: getCities
        };

        return service;

        function getCities(forceRefresh) {

            if (_areCitiesLoaded() && !forceRefresh) {

                return $q.when(_cities);
            }

            var url = baseURI;

            return $http.get(url).then(citySucceeded, _cityFailed);

            function citySucceeded(result) {

                return _cities = result.data.resource;
            }

        }

        function _areCitiesLoaded() {

            return _cities.length > 0;
        }

        function _cityFailed(error) {

            throw error;
        }
    }
})();