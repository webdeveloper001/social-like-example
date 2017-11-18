(function () {
    'use strict';

    angular
        .module('app')
        .factory('mailing', mailing);

    mailing.$inject = ['$http', '$q', '$rootScope','SERVER_URL'];

    function mailing($http, $q, $rootScope,SERVER_URL) {

        // Members
        var fbUsers = [];

        var service = {
            promoterCreated: promoterCreated,
            newBizCreated: newBizCreated,
            planPurchased: planPurchased,
            subscribed: subscribed,
            newImageUploaded: newImageUploaded,

        };

        return service;

        function newBizCreated(useraccnt){

            var url = SERVER_URL + 'mailing/newBizCreated';
            var req = {
                method: 'POST',
                data: useraccnt,
                url: url,
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                }
            }

            return $http(req);
        }

        function newImageUploaded(data){
            var url = SERVER_URL + 'mailing/newImageUploaded';
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
        function promoterCreated(promoter){
            var url = SERVER_URL + 'mailing/promoterCreated';
            var req = {
                method: 'POST',
                data: promoter,
                url: url,
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                }
            }

            return $http(req);
        }

        function planPurchased(data){
            var url = SERVER_URL + 'mailing/planPurchased';
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
        
        function subscribed(email, username){
            var url = SERVER_URL + 'mailing/userSubscribed';
            var req = {
                method: 'POST',
                data: {email: email, username: username},
                url: url,
                headers: {
                    'X-Dreamfactory-API-Key': undefined,
                    'X-DreamFactory-Session-Token': undefined
                }
            }

            return $http(req);
        }
        // function planPurchased(data){
        //     var url = SERVER_URL + 'mailing/planPurchased';
        //     var req = {
        //         method: 'POST',
        //         data: data,
        //         url: url,
        //         headers: {
        //             'X-Dreamfactory-API-Key': undefined,
        //             'X-DreamFactory-Session-Token': undefined
        //         }
        //     }

        //     return $http(req);
        // }

    }
})();