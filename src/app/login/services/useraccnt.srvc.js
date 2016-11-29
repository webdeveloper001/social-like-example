(function () {
    'use strict';

    angular
        .module('app')
        .factory('useraccnt', useraccnt);

    useraccnt.$inject = ['$http','$q','$rootScope'];

    function useraccnt($http, $q, $rootScope) {

        var _useraccnts = [];
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

                return $q.when(_useraccnts);
            }

            var url = baseURI + '' + '?filter=(user='+$rootScope.user.id+')';

            return $http.get(url).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {

                return _useraccnts = result.data.resource;
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

            var url = baseURI;

            return $http.post(url, obj, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: obj
            }).then(querySucceeded, _queryFailed);
            function querySucceeded(result) {

                //update local copy
                var datax = data;
                datax.id = result.data.resource[0].id; 
                _useraccnts.push(datax);
                
                console.log("User account successfully added.");
                return result.data;
            }
        }

        /*
        *
        * Function to update user detail in user_detail table
        *
        */
        function updateuseraccnt(recid, field, val) {
           
            //form match record
            var obj = {};
            obj.resource = [];

            var data = {};
            data.id = recid;
            //data.id = user;
            
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
            //console.log("obj.resource - ", obj);

            var url = baseURI;
            
            //update local copy
            var idx = _useraccnts.map(function(x) {return x.id; }).indexOf(recid);  
            for (var i=0; i<field.length; i++){
                switch (field[i]){
                    case "bizcat": _useraccnts[idx].bizcat = val[i]; break;
                    case "email": _useraccnts[idx].email = val[i]; break;
                    case "status": _useraccnts[idx].status = val[i]; break;
                    case "stripeid": _useraccnts[idx].stripeid = val[i]; break;
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
                $rootScope.$emit('clear-notification-warning');
                return result.data;
            }
        }

        function _isuseraccntLoaded() {

            return _useraccnts.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();