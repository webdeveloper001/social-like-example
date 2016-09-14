(function () {
    'use strict';

    var app = angular.module('login');

    // Configure the states and state resolvers
    app.config(['$stateProvider', '$urlRouterProvider', stateConfigurator]);

    function stateConfigurator($stateProvider, $urlRouterProvider) {

        var states = [
            {
                name: 'login',
                url: '/login',
                templateUrl: 'app/login/partials/login.html',
                controller: 'login as vm'
            },
            {
                name: 'bizlogin',
                url: '/bizlogin',
                templateUrl: 'app/login/partials/bizlogin.html',
                controller: 'bizlogin as vm'
            },
            {
                name: 'register',
                url: '/register',
                templateUrl: 'app/login/partials/register.html',
                controller: 'register as  vm'
            }
        ];

        $(states).each(function () {

            $stateProvider.state(this);
        });
    }
})();