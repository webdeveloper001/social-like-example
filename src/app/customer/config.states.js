(function () {
    'use strict';

    var app = angular.module('app');

    // Configure the states and state resolvers
    app.config(['$stateProvider', '$urlRouterProvider', stateConfigurator]);

    function stateConfigurator($stateProvider, $urlRouterProvider) {

        var states = [            
            {
                name: 'customer',
                url: '/customer',
                views: {
                    "@": {
                        templateUrl: 'app/customer/Partials/customer.html',
                        controller: 'customer as vm'
                    },
                    "navbar@customer": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                },
            },
            {
                name: 'mainphoto',
                parent: 'customer',
                url: '/mainphoto',
                templateUrl: 'app/customer/Partials/mainphoto.html',
                controller: 'mainphoto as vm'               
            },
            {
                name: 'photogallery',
                parent: 'customer',
                url: '/photogallery',
                templateUrl: 'app/customer/Partials/photogallery.html',
                controller: 'photogallery as vm'               
            }
        ];

        $(states).each(function () {

            $stateProvider.state(this);
        });
    }
})();