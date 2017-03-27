(function () {
    'use strict';

    angular
        .module('app')
        .factory('codeprice', codeprice);

    codeprice.$inject = ['$http', '$q', '$rootScope'];

    function codeprice($http, $q, $rootScope) {

        // Members
        var _codeprices = [];
        var baseURI = '/api/v2/mysql/_table/codeprice';

        var service = {
            get: get,
        };

        return service;

        function get(forceRefresh) {
            
            if (_areQueriesLoaded() && !forceRefresh) {

                return $q.when(_codeprices);
            }

            var url = baseURI;

            return $http.get(url).then(codepriceSucceeded, _codepriceFailed);

            function codepriceSucceeded(result) {

                return _codeprices = result.data.resource;
            }

        }
        
        
        function _areQueriesLoaded() {

            return _codeprices.length > 0;
        }

        function _codepriceFailed(error) {

            throw error;
        }
    }
})();