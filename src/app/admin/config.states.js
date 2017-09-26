(function () {
    'use strict';

    var app = angular.module('app');

    // Configure the states and state resolvers
    app.config(['$stateProvider', '$urlRouterProvider', stateConfigurator]);

    function stateConfigurator($stateProvider, $urlRouterProvider) {

        var states = [            
            {
                name: 'admin',
                url: '/admin',
                parent: 'layout',
                templateUrl: 'app/admin/Partials/admin.html',
                controller: 'admin as vm'
                /*views: {
                    "@": {
                        templateUrl: 'app/admin/Partials/admin.html',
                        controller: ''
                    },
                    "navbar@admin": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }*/
            },
            {
                name: 'queries',
                parent: 'admin',
                url: '/queries',
                templateUrl: 'app/admin/Partials/queries.html',
                controller: 'queries as vm'               
            },
            {
                name: 'views',
                parent: 'admin',
                url: '/views',
                templateUrl: 'app/admin/Partials/views.html',
                controller: 'views as vm'               
            },
            {
                name: 'flags',
                parent: 'admin',
                url: '/flags',
                templateUrl: 'app/admin/Partials/flags.html',
                controller: 'flags as vm'               
            },
            {
                name: 'addRank',
                parent: 'admin',
                url: '/addRank',
                templateUrl: 'app/admin/Partials/addRank.html',
                controller: 'addRank as vm'               
            },
            {
                name: 'dbMaint',
                parent: 'admin',
                url: '/dbMaint',
                templateUrl: 'app/admin/Partials/dbMaint.html',
                controller: 'dbMaint as vm'               
            },
            {
                name: 'mergeAnswers',
                parent: 'admin',
                url: '/mergeAnswers',
                templateUrl: 'app/admin/Partials/mergeAnswers.html',
                controller: 'mergeAnswers as vm'               
            },
             {
                name: 'dbQuery',
                parent: 'admin',
                url: '/dbQuery',
                templateUrl: 'app/admin/Partials/dbQuery.html',
                controller: 'dbQuery as vm'               
            },
            {
                name: 'imagesmod',
                parent: 'admin',
                url: '/imagemod',
                templateUrl: 'app/admin/Partials/imagesmod.html',
                controller: 'imagesmod as vm'               
            },
            {
                name: 'staticpagesconsole',
                parent: 'admin',
                url: '/staticpagesconsole',
                templateUrl: 'app/admin/Partials/staticpagesconsole.html',
                controller: 'staticpagesconsole as vm'               
            },
            {
                name: 'locations',
                parent: 'admin',
                url: '/locations',
                templateUrl: 'app/admin/Partials/locations.html',
                controller: 'locations as vm'               
            },
             {
                name: 'updateHeaders',
                parent: 'admin',
                url: '/updateHeaders',
                templateUrl: 'app/admin/Partials/updateHeaders.html',
                controller: 'updateHeaders as vm'               
            },
             {
                name: 'foodRanks',
                parent: 'admin',
                url: '/foodRanks',
                templateUrl: 'app/admin/Partials/foodRanks.html',
                controller: 'foodRanks as vm'               
            },
            {
                name: 'sibLocs',
                parent: 'admin',
                url: '/sibLocs',
                templateUrl: 'app/admin/Partials/sibLocs.html',
                controller: 'sibLocs as vm'               
            },
            {
                name: 'payment',
                parent: 'admin',
                url: '/payment',
                templateUrl: 'app/admin/Partials/payment.html',
                controller: 'payment as vm'               
            },
            {
                name: 'plan',
                parent: 'admin',
                url: '/plan',
                templateUrl: 'app/admin/Partials/plan.html',
                controller: 'plan as vm'               
            },
            {
                name: 'bizadmin',
                parent: 'admin',
                url: '/bizadmin',
                templateUrl: 'app/admin/Partials/bizadmin.html',
                controller: 'bizadmin as vm'               
            },
            {
                name: 'cleandb',
                parent: 'admin',
                url: '/cleandb',
                templateUrl: 'app/admin/Partials/cleandb.html',
                controller: 'cleandb as vm'               
            },
            {
                name: 'rodconsole',
                url: '/rodconsole',
                parent: 'layout',
                templateUrl: 'app/admin/Partials/rodconsole.html',
                controller: 'rodconsole as vm'
                /*views: {
                    "@": {
                        templateUrl: 'app/admin/Partials/rodconsole.html',
                        controller: 'rodconsole as vm'
                    },
                    "navbar@rodconsole": {
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