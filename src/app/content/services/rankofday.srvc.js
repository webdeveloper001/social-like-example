(function () {
    'use strict';

    angular
        .module('app')
        .factory('rankofday', rankofday);

    rankofday.$inject = ['$http', '$q','$rootScope'];

    function rankofday($http, $q, $rootScope) {

        // Members
        var _rankofday = [];
        var baseURI = '/api/v2/mysql/_table/rankofday';

        var service = {
            getrankofday: getrankofday,
        };

        return service;

        function getrankofday(forceRefresh) {

            //if (_arerankofdayLoaded() && !forceRefresh) {

            //    return $q.when(_rankofday);
            //}
            
             //get todays date
            var datenow = new Date();
            var tz = datenow.getTimezoneOffset();
            datenow.setMinutes( datenow.getMinutes() - tz);
            var dateStr = datenow.toLocaleDateString();
            
            var url = baseURI + '/?filter=date='+ dateStr;

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _rankofday = result.data.resource;
            }
        }
        
        function _arerankofdayLoaded() {

            return _rankofday.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();