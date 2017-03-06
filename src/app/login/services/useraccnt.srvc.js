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
            updateuseraccnt: updateuseraccnt
    };
    return service;



      /*
       *
       * Function to get user detail from user_detail table for logged in user
       *
       */
      function getuseraccnt(forceRefresh) {
        // console.log("useraccnt.srvc.js:getuseraccnt(forcerefresh): START");
          if (_isuseraccntLoaded() && !forceRefresh) {

              return $q.when(_useraccnts);
          }

          var url = baseURI + '' + '?filter=(user='+$rootScope.user.id+')';
          // console.log("useraccnt.srvc.js:getuseraccnt(forcerefresh): GET");
          return $http.get(url).then(querySucceeded, _queryFailed);

          function querySucceeded(result) {
            // console.log("useraccnt.srvc.js:getuseraccnt(forcerefresh): GET: SUCCESS");
            // console.log("result.data.resource: " + JSON.stringify(result.data.resource[0]));

              // return _useraccnts = result.data.resource[0];
              return _useraccnts = result.data.resource;
          }

      }

      /*
       *
       * Function to add user detail in user_detail table
       *
       */
      function adduseraccnt(answer) {
          /*
        console.log("START useraccnt.srvc.js:adduseraccnt:$rootScope.user.id: " + $rootScope.user.id)

        // check if the DF account already exists
        var url = baseURI + '' + '?filter=(user='+$rootScope.user.id+')';
        return $http.get(url).then(userSearchResult, _queryFailed);
        function userSearchResult(result) {
          var data = result.data.resource;
          var count = 0;
          if (data) {
            count = parseInt(JSON.stringify(data.length));
            // console.log("count: " + count);
            if (count > 0) {

              user = JSON.parse(localStorage.getItem("user"));
              user.dfUseraccntId = result.data.resource[0].id;
              user.stripeId = result.data.resource[0].stripeid
              window.localStorage.user = JSON.stringify(user);
              user = JSON.parse(localStorage.getItem("user"));

              console.log("YES found the DF account, user: " + JSON.stringify(user));

              return 0;
            } else {

              console.log("NO, did not find the DF account");

              var user = {};
              user = JSON.parse(localStorage.getItem("user"));

              console.log("app/login/services/useraccnt.srvc.js:userLocalStorage: " + JSON.stringify(user) );
*/
              //form match record
              var data = {};

              data.user = $rootScope.user.id;
              data.answer = answer.id;
              data.bizcat = 'REB'
              data.status = 'Basic';
              data.stripeid = '0';
              data.email = '';

              // MINIMUM NEEDED
              // "user":999,
              // "answer":0,
              // "bizcat":0,
              // "status":0

                var obj = {};
                obj.resource = [];
                obj.resource.push(data);

                //console.log("src/app/login/services/useraccnt.srvc.js:adduseraccnt():obj.resource = " + JSON.stringify(obj.resource) );
                // [{"answer":"","bizcat":"REB","status":"Non-paying","stripeid":"dskjflskdjflskjd","email":"10154674551822270+facebook@facebook.com"}]

                var url = baseURI;

                return $http.post(url, obj, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    },
                    body: obj
                }).then(querySucceeded, _queryFailed);

                function querySucceeded(result) {
                    /*
                  console.log("useraccnt.srvc.js:querySucceeded:result:" + JSON.stringify(result));
                  console.log("the new useraccnt ID: " + result.data.resource[0].id);

                  user = JSON.parse(localStorage.getItem("user"));
                  user.dfUseraccntId = result.data.resource[0].id;
                  user.stripeId = result.data.resource[0].stripeid
                  window.localStorage.user = JSON.stringify(user);
                  user = JSON.parse(localStorage.getItem("user"));

                  console.log("useraccnt.srvc.js:user:" + JSON.stringify(user));
                  */

                  // window.localstorage.setItem("dfUseraccntId", result.data.resource[0].id);
                  // localStorage.user.dfUseraccntId = result.data.resource[0].id;
 //useraccnt.srvc.js:querySucceeded:result:{"data":{"resource":[{"id":112}]},"status":200,"config":{"method":"POST","transformRequest":[null],"transformResponse":[null],"headers":{"Content-Type":"multipart/form-data","Accept":"application/json, text/plain, */*","X-Dreamfactory-API-Key":"8b8174170d616f3adb571a0b28daf65a0cf07aa149aad9bf6554986856debdf4"},"body":{"resource":[{"user":37,"answer":0,"bizcat":"REB","status":"Non-paying","stripeid":"test","email":"sjurowski+facebook@ucsd.edu"}]},"url":"https://api.rank-x.com/api/v2/mysql/_table/useraccnts","data":{"resource":[{"user":37,"answer":0,"bizcat":"REB","status":"Non-paying","stripeid":"test","email":"sjurowski+facebook@ucsd.edu"}]}},"statusText":"OK"}

                  // console.log("useraccnt.srvc.js:localStorage.user:" + JSON.stringify(localStorage.user));
//useraccnt.srvc.js:localStorage.user:"{\"email\":\"sjurowski+facebook@ucsd.edu\",\"first_name\":\"Sandon\",\"host\":\"bitnami-dreamfactory-df88\",\"id\":37,\"is_sys_admin\":false,\"last_login_date\":\"2016-12-13 21:04:47\",\"last_name\":\"Jurowski\",\"name\":\"Sandon Jurowski\",\"role\":\"rank-user\",\"role_id\":1,\"session_id\":\"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNjYzMDg3LCJleHAiOjE0ODE2NjY2ODcsIm5iZiI6MTQ4MTY2MzA4NywianRpIjoiYWQ2M2Q0OTI1MDRmNTJiYjBkMWZiZjJkNzAxMjQzNDMifQ.T-3B-jnz4d2Q2Q5rfN1ePF7ujin982gzPYbRwhLo9Uc\",\"session_token\":\"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNjYzMDg3LCJleHAiOjE0ODE2NjY2ODcsIm5iZiI6MTQ4MTY2MzA4NywianRpIjoiYWQ2M2Q0OTI1MDRmNTJiYjBkMWZiZjJkNzAxMjQzNDMifQ.T-3B-jnz4d2Q2Q5rfN1ePF7ujin982gzPYbRwhLo9Uc\"}"

                  //update local copy
                  var datax = data;
                  datax.id = result.data.resource[0].id; 
                  _useraccnts.push(datax);

                  //return the ID of the new account row
                  return result.data.resource[0].id;
                }
            }
  /*        }
        }
      }
*/

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

              // console.log("User account successfully updated.");
              $rootScope.$emit('clear-notification-warning');
              return result.data;
          }
      }


      function _isuseraccntLoaded() {

          if (!_useraccnts) {
            return false
          } else {
            return _useraccnts.length > 0;
          }
      }

      function _queryFailed(error) {
        //
        // console.log("app/login/services/useraccnt.srvc.js:_queryFailed(error):result.data: " + JSON.stringify(result.data);

          throw error;
      }
    }
})();
