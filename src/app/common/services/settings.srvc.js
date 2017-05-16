(function () {
    'use strict';

    angular
        .module('app')
        .factory('setting', setting);

    setting.$inject = ['$http', '$q', '$rootScope','SERVER_URL'];

    function setting($http, $q, $rootScope,SERVER_URL) {

        // Members
        var fbUsers = [];

        var service = {
            getSetting: getSetting,
            setSetting: setSetting,
        };

        return service;

        function getSetting(){
            var url = SERVER_URL + 'settings/';
            var req = {
                method: 'GET',
                url: url,
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                }
            }

            return $http(req).then(function(result){
                $rootScope.setting = result.data.settings;
                return result.data.settings;
            });
        }

        function setSetting(commission_percent){
            
        }

    }
})();