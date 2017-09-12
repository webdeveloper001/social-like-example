(function () {
    'use strict';

    var app = angular.module('app');

    // Configure the states and state resolvers
    app.config(['$stateProvider', '$urlRouterProvider', stateConfigurator]);

    function stateConfigurator($stateProvider, $urlRouterProvider) {

        var states = [            
            {
                name: 'promote',
                url: '/promote',
                parent: 'layout',
                templateUrl: 'app/promoters/Partials/promote.html',
                controller: 'promote as vm'
                /*views: {
                    "@": {
                        templateUrl: 'app/promoters/Partials/promote.html',
                        controller: 'promote as vm'
                    },
                    "navbar@admin": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }*/
            }
        ];

        $(states).each(function () {

            $stateProvider.state(this);
        });
    }
})();