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
            setCodePrice: setCodePrice
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

        function setSetting(setting){
            var url = SERVER_URL + 'settings/';
            var req = {
                method: 'POST',
                url: url,
                data: setting,
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

        function setCodePrice(codepriceObj, newPrice){
            var url = SERVER_URL + 'codeprice/';
            var req = {
                method: 'POST',
                url: url,
                data: {
                    codeprice:codepriceObj,
                    newPrice: newPrice
                },
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                }
            }

            return $http(req);
        }

    }
})();