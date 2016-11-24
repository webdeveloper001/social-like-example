(function () {
    'use strict';

    angular
        .module('app')
        .factory('useraccnt', useraccnt);

    useraccnt.$inject = ['$http', '$q','$rootScope'];

    function useraccnt($http, $q, $rootScope) {

        var _useraccnt = [];
        var baseURI = '/api/v2/mysql/_table/useraccnts';

        var service = {
            getuseraccnt: getuseraccnt,
            adduseraccnt: adduseraccnt,
            updateuseraccnt: updateuseraccnt
        };

        return service;

        /*
         *
         * Function to get user detail from user_detail table for logged in user
         *
         */
        function getuseraccnt(forceRefresh) {

            if (_isuseraccntLoaded() && !forceRefresh) {

                return $q.when(_useraccnt);
            }

            var url = baseURI + '' + '?filter=(user='+$rootScope.user.id+')';

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _useraccnt = result.data.resource;
            }

        }

        /*
         *
         * Function to add user detail in user_detail table
         *
         */
        function adduseraccnt() {

            //form match record
            var data = {};
            data.user = $rootScope.user.id;
            data.answer = $rootScope.canswer.id;
            data.bizcat = 'REB'
            data.status = 'Non-paying';
            data.stripeid = '';
            data.email = '';

            var obj = {};
            obj.resource = [];

            obj.resource.push(data);

            //update local copy
            _useraccnt.push(data);

            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("User account successfully added.");
                return result.data;
            }
        }

        /*
        *
        * Function to update user detail in user_detail table
        *
        */
        function updateuseraccnt(rec_id, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = rec_id;
            
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "bizcat": data.bizcat = val[i]; break;
                    case "email": data.email = val[i]; break;
                    case "status": data.status = val[i]; break;
                    case "stripeid": data.stripeid = val[i]; break;
                }
            }
            //console.log("data", data);
            obj.resource.push(data);

            var url = baseURI;
            
            //update local copy
            var idx = _useraccnt.map(function(x) {return x.id; }).indexOf(rec_id);  
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "bizcat": _useraccnt[idx].bizcat = val[i]; break;
                    case "email": _useraccnt[idx].email = val[i]; break;
                    case "status": _useraccnt[idx].status = val[i]; break;
                    case "stripeid": _useraccnt[idx].stripeid = val[i]; break;
                }
            }                        

            return $http.patch(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                console.log("User account successfully updated.");
                return result.data;
            }
        }

        function _isuseraccntLoaded() {

            return _useraccnt.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();