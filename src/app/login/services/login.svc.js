(function () {
    'use strict';

    angular
        .module('app')
        .factory('login', login);

    login.$inject = ['$http', '$q', '$cookies', '$rootScope', 'INSTANCE_URL','$state','$location','$window'];

    function login($http, $q, $cookies, $rootScope, INSTANCE_URL, $state, $location, $window) {
        var service = {
            initiate: initiate,
            loginWithFacebook: loginWithFacebook,
            oauthWithFacebook: oauthWithFacebook,
            register: register,
            logout: logout,
            setFakeLocalUser: setFakeLocalUser
        };
        // getUserObjectFromLocalStorage: getUserObjectFromLocalStorage,

        return service;

        function initiate(options) {
          console.log("login/services/login.svc.js:initiate");

            return $http.post('/api/v2/user/session', options).then(function (result) {
                $http.defaults.headers.common['X-DreamFactory-Session-Token'] = result.data.session_token;
                $cookies.session_token = result.data.session_token;

                $rootScope.user = result.data;

                try {
                    window.localStorage.user = JSON.stringify(result.data);
                } catch (e) { }
            });
        }

        function loginWithFacebook() {

            var statename = '';
            var statenum = 0;
            var ccategory = 0;

            //Store in cookies memory to redirect after login, ignore state:login
            if ($rootScope.stateName == undefined) statename = $state.current.name;
            else statename = $rootScope.stateName;

            if ($rootScope.stateName == undefined) {
                if (statename == 'rankSummary') statenum = $rootScope.cCategory.id;
                if (statename == 'answerDetail') statenum = $rootScope.canswer.id;
            }
            else statenum = $rootScope.stateNum;

            if ($rootScope.cCategory != undefined) ccategory = $rootScope.cCategory.id;
            else ccategory = undefined;

            $cookies.put('statename', statename);
            $cookies.put('statenum', statenum);
            $cookies.put('ccategory', ccategory);

            var deferred = $q.defer();
            var url = INSTANCE_URL + '/api/v2/user/session?service=facebook';

            deferred.resolve({ url: url });

            return deferred.promise;

            //return $http.post('/api/v2/user/session?service=facebook', {}).then(querySucceeded, _queryFailed);

            //function querySucceeded(result) {

            //    console.log("facebook result", result);
            //}
        }

        function oauthWithFacebook(queryString) {

            return $http.post('/api/v2/user/session?oauth_callback=true&service=facebook&' + queryString).then(querySucceeded, _queryFailed);

            function querySucceeded(result) {
                console.log("oauth results", result);
                $http.defaults.headers.common['X-DreamFactory-Session-Token'] = result.data.session_token;
                $cookies.session_token = result.data.session_token;

                $rootScope.user = result.data;
                $rootScope.isLoggedIn = true;

                try {
                    window.localStorage.user = JSON.stringify(result.data);
                    //$window.location.search = '';
                } catch (e) { }

                if ($rootScope.DEBUG_MODE) console.log("oauthWithFacebook succesful");
                $rootScope.$emit('redirectAfterLogin');
            }
        }

        function logout() {

            return $http.delete('/api/v2/user/session').then(function (result) {

                delete $http.defaults.headers.common['X-DreamFactory-Session-Token'];
                $cookies.remove('session_token');
                delete $rootScope.user;
                $rootScope.isLoggedIn = false;

                try {
                    window.localStorage.removeItem('user');
                } catch (e) { }

            });
        }

        function _queryFailed(error) {

            console.log("error", error);
            throw error;
        }

        function register(options) {


            console.log("options", options);
            return $http.post('/api/v2/user/register?login=true', options).then(function (result) {
                console.log("register result", result);

            }, function (error) {

                console.log("error", error);
            });
        }

                function setFakeLocalUser() {

                  // On the production facebook login, the
                  // localstorage data object is like:
                  // --------------------------------------
                     // key:user
                     //value:{"session_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNTgxNDEyLCJleHAiOjE0ODE1ODUwMTIsIm5iZiI6MTQ4MTU4MTQxMiwianRpIjoiYzNlOGI4ZDYxZThmNzEzMTdhNzAyNDM3ODk5OTA3MDEifQ.o4myV3Yb-3l-_xcEHI8fsRO4HCxuR7e4hUW--Jy94Vk","session_id":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNTgxNDEyLCJleHAiOjE0ODE1ODUwMTIsIm5iZiI6MTQ4MTU4MTQxMiwianRpIjoiYzNlOGI4ZDYxZThmNzEzMTdhNzAyNDM3ODk5OTA3MDEifQ.o4myV3Yb-3l-_xcEHI8fsRO4HCxuR7e4hUW--Jy94Vk","id":29,"name":"Sandon Jurowski","first_name":"Sandon","last_name":"Jurowski","email":"sjurowski+facebook@ucsd.edu","is_sys_admin":false,"last_login_date":"2016-12-12 22:23:32","host":"bitnami-dreamfactory-df88","role":"rank-user","role_id":1}

                    // OLD value:{"session_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNTgxNDEyLCJleHAiOjE0ODE1ODUwMTIsIm5iZiI6MTQ4MTU4MTQxMiwianRpIjoiYzNlOGI4ZDYxZThmNzEzMTdhNzAyNDM3ODk5OTA3MDEifQ.o4myV3Yb-3l-_xcEHI8fsRO4HCxuR7e4hUW--Jy94Vk","session_id":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNTgxNDEyLCJleHAiOjE0ODE1ODUwMTIsIm5iZiI6MTQ4MTU4MTQxMiwianRpIjoiYzNlOGI4ZDYxZThmNzEzMTdhNzAyNDM3ODk5OTA3MDEifQ.o4myV3Yb-3l-_xcEHI8fsRO4HCxuR7e4hUW--Jy94Vk","id":29,"name":"Sandon Jurowski","first_name":"Sandon","last_name":"Jurowski","email":"10154674551822270+facebook@facebook.com","is_sys_admin":false,"last_login_date":"2016-12-12 22:23:32","host":"bitnami-dreamfactory-df88","role":"rank-user","role_id":1}

                  // on logout, the above object is deleted
                  // --------------------------------------

                           //  from the mysql db on dreamfactory 20161127
                           //  "id": 34,
                           //  "name": "Sandon Jurowski",
                           //  "first_name": "Sandon",
                           //  "last_name": "Jurowski",
                           //  "last_login_date": null,
                           //  "email": "sjurowski@ucsd.edu",

                          //  login.initiate();

                          //  $rootScope.isLoggedIn = true;
                          //  $rootScope.user = {};
                          //  $rootScope.answeridxgps = 1258; //starting indx for gps conversion
                          //  $rootScope.user.id = 34;
                          //  $rootScope.user.email = "sjurowski@ucsd.edu";
                          //  $rootScope.user.name = "Sandon Jurowski";
                          //  $rootScope.user.first_name = 'Sandon';
                          //  $rootScope.isAdmin = true;
                          //  vm.isAdmin = true;
                          //
                          //  // *** end sgj portal.works ***
                          //
                          //
                          // vm.user = $rootScope.user;
                          // vm.goBack = goBack;
                          // vm.goPremium = goPremium;
                  // --------------------------------------


                  // taking the place of result.data below
                  var fakeResult = new Object();

                  fakeResult.email = "sjurowski+facebook@ucsd.edu";

                  // fakeResult.email = "10154674551822270+facebook@facebook.com";
                  fakeResult.first_name = "Sandon";
                  fakeResult.host = "bitnami-dreamfactory-df88";
                  fakeResult.id = 37;
                  // fakeResult.id = 29;
                  fakeResult.is_sys_admin = false;
                  fakeResult.last_login_date = "2016-12-13 21:04:47";
                  fakeResult.last_name = "Jurowski";
                  fakeResult.name = "Sandon Jurowski";
                  fakeResult.role = "rank-user";
                  fakeResult.role_id = 1;
                  fakeResult.session_id = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNjYzMDg3LCJleHAiOjE0ODE2NjY2ODcsIm5iZiI6MTQ4MTY2MzA4NywianRpIjoiYWQ2M2Q0OTI1MDRmNTJiYjBkMWZiZjJkNzAxMjQzNDMifQ.T-3B-jnz4d2Q2Q5rfN1ePF7ujin982gzPYbRwhLo9Uc";
                  fakeResult.session_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNjYzMDg3LCJleHAiOjE0ODE2NjY2ODcsIm5iZiI6MTQ4MTY2MzA4NywianRpIjoiYWQ2M2Q0OTI1MDRmNTJiYjBkMWZiZjJkNzAxMjQzNDMifQ.T-3B-jnz4d2Q2Q5rfN1ePF7ujin982gzPYbRwhLo9Uc";

                  console.log("oauth fake setting", fakeResult);
                  $http.defaults.headers.common['X-DreamFactory-Session-Token'] = fakeResult.session_token;

                  $cookies.session_token = fakeResult.session_token;

                  $rootScope.user = fakeResult;

                  try {
                      window.localStorage.user = JSON.stringify(fakeResult);

                      // returning just "fakeResult" doesn't preserve the details
                      return {
                        email: fakeResult.email,
                        first_name: fakeResult.first_name,
                        host: fakeResult.host,
                        id: fakeResult.id,
                        is_sys_admin: fakeResult.is_sys_admin,
                        last_login_date: fakeResult.last_login_date,
                        last_name: fakeResult.last_name,
                        name: fakeResult.name,
                        role: fakeResult.role,
                        role_id: fakeResult.role_id,
                        session_id: fakeResult.session_id,
                        session_token: fakeResult.session_token
                      };
                  } catch (e) { }

                }
                // end sgj portal.works




    }
})();
