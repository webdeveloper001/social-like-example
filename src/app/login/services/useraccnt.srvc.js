(function () {
    'use strict';

    angular
        .module('app')
        .factory('useraccnt', useraccnt);

    useraccnt.$inject = ['$http','$q','$rootScope', 'login'];

    function useraccnt($http, $q, $rootScope, login) {

        var _useraccnts = [];
        var baseURI = '/api/v2/mysql/_table/useraccnts';

        var service = {
            getuseraccnt: getuseraccnt,
            adduseraccnt: adduseraccnt,
            updateuseraccnt: updateuseraccnt,
            setupFreeBillingAccount: setupFreeBillingAccount
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
          console.log("START useraccnt.srvc.js:adduseraccnt")
          //localhost testing
          // $rootScope.user = login.setFakeLocalUser();
          // $rootScope.user = JSON.parse(localStorage.getItem("user"));
          // $rootScope.user = window.localStorage.user;

          // these are equivalent:
          //   localStorage.getItem("user")
          //   window.localStorage["user"]
          //
          // var currentUserLocalStorage = {};
          //
          // console.log("key-value pair testing:")
          //
          // JSON.parse(localStorage.getItem("user"), (key,value) => {
          //   if(key=="email") {
          //     currentUserLocalStorage.email = value;
          //   }
          //   if(key=="email") {
          //     currentUserLocalStorage.email = value;
          //   }
          //   console.log(key); // log the current property name, the last is ""
          //   console.log(value); // log the current property value
          // });
          // return currentUserLocalStorage; //user object


          var userLocalStorage = login.getUserObjectFromLocalStorage();
            // user.email
            // user.first_name
            // user.host
            // user.id
            // user.is_sys_admin
            // user.last_login_date
            // user.last_name
            // user.name
            // user.role
            // user.role_id
            // user.session_id
            // user.session_token

          //form match record
          var data = {};
          // data.user = window.localStorage.user.id;
          // data.answer = $rootScope.canswer.id;
          // data.bizcat = 'REB'
          // data.status = 'Non-paying';
          // data.stripeid = '';
          // data.email = '';

          data.user = userLocalStorage.id;
          data.answer = "";
          data.bizcat = 'REB'
          data.status = 'Non-paying';
          data.stripeid = 'dskjflskdjflskjd';
          data.email = userLocalStorage.email;

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


        function setupFreeBillingAccount() {
          // make the POST call to Stripe
          // obtain the RESPONSE from Stripe
          // create the "business user account" on main DB w/ Stripe ID

          // localhost testing ...
          adduseraccnt();
        }

        function _isuseraccntLoaded() {

            return _useraccnts.length > 0;
        }

        function _queryFailed(error) {

            throw error;
        }
    }
})();
