(function () {
    'use strict';

    angular
        .module('app')
        .factory('login', login);

    login.$inject = ['$http', '$q', '$cookies', '$rootScope', 'INSTANCE_URL'];

    function login($http, $q, $cookies, $rootScope, INSTANCE_URL) {
        var service = {
            initiate: initiate,
            loginWithFacebook: loginWithFacebook,
            oauthWithFacebook: oauthWithFacebook,
            register: register,
            logout: logout
        };

        return service;

        function initiate(options) {

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

                try {
                    window.localStorage.user = JSON.stringify(result.data);
                } catch (e) { }
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
    }
})();