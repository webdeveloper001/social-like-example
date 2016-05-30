﻿(function () {
    'use strict';
    var app = angular.module('app');

    app.config(configure);

    configure.$inject = ['$httpProvider'];

    function configure($httpProvider) {

        // http interceptor
        $httpProvider.interceptors.push('httpInterceptor');
    }
})();