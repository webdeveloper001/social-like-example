(function () {
    'use strict';

    angular
        .module('login')
        .factory('httpInterceptor', httpInterceptor);

    httpInterceptor.$inject = ['$location', '$q', '$injector', 'INSTANCE_URL'];

    function httpInterceptor($location, $q, $injector, INSTANCE_URL) {
        var service = {
            request: request,
            responseError: responseError
        };

        return service;

        function request(config) {

            // Append instance url before every api call
            if (config.url.indexOf('/api/v2') > -1) {
                config.url = INSTANCE_URL + config.url;
            };

            // Append instance url before every api call
            if (config.url.indexOf('api.instagram.com') > -1) {
                config.headers.useXDomain = true;
                config.headers.common = 'Content-Type: application/json';
                delete config.headers.common['X-Requested-With'];
                delete config.headers['X-DreamFactory-Session-Token'];
                delete config.headers['X-Dreamfactory-API-Key'];

            };
            // delete x-dreamfactory-session-token header if login
            if (config.method.toLowerCase() === 'post' && config.url.indexOf('/api/v2/user/session') > -1) {
                delete config.headers['X-DreamFactory-Session-Token'];
            }

            return config;
        }

        function responseError(result) {
            
            //console.log("result", result);

            // handle redirections for facebook login
            if (result.status == 302) {

                //console.log("result", result);
                $location.path('/login');
                return $q.reject(result);
            }

            // If status is 401 or 403 with token blacklist error then redirect to login
            if (result.status === 401 || (result.status === 403 && result.data.error.message.indexOf('token') > -1)) {
                $location.path('/login');
            }

            return $q.reject(result);
        }
    }
})();