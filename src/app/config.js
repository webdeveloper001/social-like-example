(function () {
    'use strict';
    var app = angular.module('app');

    app.config(configure);

    configure.$inject = ['$httpProvider','$locationProvider', '$facebookProvider'];

    function configure($httpProvider, $locationProvide, $facebookProvider) {

        // http interceptor
        $httpProvider.interceptors.push('httpInterceptor');
        $facebookProvider.setAppId('1102409523140826');
    }
})();
