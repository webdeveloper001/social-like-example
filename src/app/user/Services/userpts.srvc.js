(function () {
    'use strict';

    angular
        .module('app')
        .service('userpts', userpts);

    userpts.$inject = [$http];

    function userpts($rootScope, $http) {

        //Members
        var action_points = [];
        var baseURI = "/api/v2/mysql/_table/"

        var service = {
            addrec: addrec,
            getrecsbyuser: getrecsbyuser,
            deleterec: deleterec,
            getactionpoints: getactionpoints,
            getuserlevels: getuserlevels
        };

        return service;

        function getActionPoint(uaf) {
            var action = uaf.action;
            var actionpointsURI = "/api/v2/mysql/_table/actionpoints?action=" + action;

            var url = actionpointsURI;
            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                return result.data;
            }
        }

        function addrec(uaf) {
            var url = baseURI;
            var resource = [];

            var userid = uaf.userid;
            var action_point = getActionPoint(uaf);
            var uafid = uaf.id;
            var action = actionpoint.id;
            var userpoint = {
                userid: userid,
                ufaid: ufaid,
                action: action
            };
            switch (action) {
                default:
                    resource.push(userpoint);
                    break;
            }
            return $http.post(url, resource, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: resource
            }).then(querySucceeded, _queryFailed)

            function querySucceeded(result) {
                return result.data;
            }
        }

        function getrecsbyuser(userId) {
            var url = "/api/v2/mysql/_table/userpoints?userid=" + userId;

            return $http.get(url).then(querySucceeded, _queryFailed)

            function querySucceeded(result) {
                return result.data;
            }
        }

        function deleterec(userId) {
            var url = "/api/v2/mysql/_table/userpoints?userid=" + userId;

            return $http.delete(url).then(querySucceeded, _queryFailed)

            function querySucceeded(result) {
                if ($rootScope.DEBUG_MODE) console.log("deleting matching records succeeded")
            }
        }

        function getactionpoints() {
            var actionpointsURI = "/api/v2/mysql/_table/actionpoints";

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                return result.data;
            }            
        }

        function getuserlevels() {
            var actionpointsURI = "/api/v2/mysql/_table/userlevels";

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                return result.data;
            }     
        }

        function _queryFailed(error) {

            throw error;
        }        
    }
})();