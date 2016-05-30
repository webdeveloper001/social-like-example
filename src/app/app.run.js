(function () {
    'use strict';

    angular.module('app')
        .run(configureHeaders);

    configureHeaders.$inject = ['$cookies', '$http', '$rootScope', 'APP_API_KEY'];

    function configureHeaders($cookies, $http, $rootScope, APP_API_KEY) {

        // Configure API Headers
        $http.defaults.headers.common['X-Dreamfactory-API-Key'] = APP_API_KEY;
        $http.defaults.headers.common['X-DreamFactory-Session-Token'] = $cookies.session_token;
    }
})();