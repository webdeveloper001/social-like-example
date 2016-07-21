(function () {
    'use strict';

    angular
        .module('app')
        .factory('userDetail', userDetail);

    userDetail.$inject = ['$http', '$q','$rootScope'];

    function userDetail($http, $q, $rootScope) {

        var _userDetail = [];
        var baseURI = '/api/v2/mysql/_table/user_detail';

        var service = {
            getUserDetail: getUserDetail,
            addUserDetail: addUserDetail,
            updateUserDetail: updateUserDetail
        };

        return service;

        /*
         *
         * Function to get user detail from user_detail table for logged in user
         *
         */
        function getUserDetail(forceRefresh) {

            if (_isUserDetailLoaded() && !forceRefresh) {

                return $q.when(_userDetail);
            }

            var url = baseURI + '' + '?filter=(user='+$rootScope.user.id+')';

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _userDetail = result.data.resource;
            }

        }

        /*
         *
         * Function to add user detail in user_detail table
         *
         */
        function addUserDetail() {

            //form match record
            var data = {};
            data.user = $rootScope.user.id;
            data.birth_date = $rootScope.user.birth_date;
            data.gender = $rootScope.user.gender;

            var obj = {};
            obj.resource = [];

            obj.resource.push(data);

            //update local copy
            _userDetail.push(data);

            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("User detail successfully added.");
                return result.data;
            }
        }

        /*
        *
        * Function to update user detail in user_detail table
        *
        */
        function updateUserDetail(rec_id) {

            //form match record
            var obj = {};
            obj.resource = [];

            var data={};
            data.id = rec_id;
            data.timestmp = Date.now();

            obj.resource.push(data);

            var url = baseURI;

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("User detail successfully updated.");
                return result.data;
            }
        }

        function _isUserDetailLoaded() {

            return _userDetail.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();