(function () {
    'use strict';
    var app = angular.module('app');

    app.config(configure);

    configure.$inject = ['$httpProvider','$locationProvider'];

    function configure($httpProvider, $locationProvider) {

        // http interceptor
        $httpProvider.interceptors.push('httpInterceptor');
        $locationProvider.hashPrefix('');
    }
})();
