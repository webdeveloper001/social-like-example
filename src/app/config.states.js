(function () {
    'use strict';

    var app = angular.module('app');

    // Configure the states and state resolvers
    app.config(['$stateProvider', '$urlRouterProvider','$locationProvider', stateConfigurator]);

    function stateConfigurator($stateProvider, $urlRouterProvider,$locationProvider) {

        // use the HTML5 History API
        //$locationProvider.html5Mode(true);

        // For any unmatched url
        $urlRouterProvider.otherwise('/home');

        var states = [
            {
                name: 'layout',
                abstract: true,
                url: '',
                views: {
                    "@": {
                        templateUrl: 'app/layout/Partials/layout.html',
                        controller: 'layout as vm'
                    },
                    "navbar@layout": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }
            },
            {
                name: 'cwrapper',
                parent: 'layout',
                //abstract: true,
                url: '/home', ///cwrapper',
                templateUrl: 'app/layout/Partials/cwrapper.html',
                controller: 'cwrapper as vm'
            },

            {
                name: 'rankSummary',
                parent: 'layout',
                url: '/rankSummary/:index',
                templateUrl: 'app/rank/Partials/RankSummary.html',
                controller: 'rankSummary as vm'
            },
            {
                name: 'editRanking',
                parent: 'layout',
                url: '/editRanking/:index',
                templateUrl: 'app/rank/Partials/editRanking.html',
                controller: 'editRanking as vm'
            },
            {
                name: 'addAnswer',
                parent: 'layout',
                url: '/addAnswer',
                templateUrl: 'app/answer/Partials/addAnswer.html',
                controller: 'addAnswer as vm'
            },
            {
                name: 'addEvent',
                parent: 'layout',
                url: '/addEvent',
                templateUrl: 'app/answer/Partials/addEvent.html',
                controller: 'addEvent as vm'
            },
            {
                name: 'editAnswer',
                parent: 'layout',
                url: '/editAnswer/:index',
                templateUrl: 'app/answer/Partials/editAnswer.html',
                controller: 'editAnswer as vm'
            },
             {
                name: 'specials',
                parent: 'layout',
                url: '/specials',
                templateUrl: 'app/customer/Partials/specials.html',
                controller: 'specials as vm'
            },
            {
                name: 'editspecial',
                parent: 'layout',
                url: '/editspecial',
                templateUrl: 'app/customer/Partials/editspecial.html',
                controller: 'editspecial as vm'
            },
            {
                name: 'addRankforAnswer',
                parent: 'layout',
                url: '/addRankforAnswer',
                templateUrl: 'app/admin/Partials/addRankforAnswer.html',
                controller: 'addRankforAnswer as vm'               
            },
            {
                name: 'answerDetail',
                parent: 'layout',
                url: '/answerDetail/:index',
                templateUrl: 'app/answer/Partials/answerDetail.html',
                controller: 'answerDetail as vm',
            },
            {
                name: 'answerRanksManager',
                parent: 'layout',
                url: '/answerRanksManager',
                templateUrl: 'app/answer/Partials/answerRanksManager.html',
                controller: 'answerRanksManager as vm',
            },
            {
                name: 'editvrows',
                parent: 'layout',
                url: '/editvrows',
                templateUrl: 'app/customer/Partials/editvrows.html',
                controller: 'editvrows as vm'
            },
            {
                name: 'addCustomRank',
                parent: 'layout',
                url: '/addCustomRank',
                templateUrl: 'app/admin/Partials/addCustomRank.html',
                controller: 'addCustomRank as vm'
            },
            {
                name: 'match',
                parent: 'layout',
                url: '/match',
                templateUrl: 'app/rank/Partials/match.html',
                controller: 'match as vm'
            },
            {
                name: 'about',
                url: '/about',
                parent: 'layout',
                templateUrl: 'app/layout/Partials/about.html',
                controller: 'about as vm'
                /*views: {
                    "@": {
                        templateUrl: 'app/layout/Partials/about.html',
                        controller: 'about as vm'
                    },
                    "navbar@about": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }*/
            },
            {
                name: 'privacypolicy',
                url: '/privacypolicy',
                parent: 'layout',
                templateUrl: 'app/layout/Partials/privacypolicy.html',
                controller: 'privacypolicy as vm'
                /*views: {
                    "@": {
                        templateUrl: 'app/layout/Partials/privacypolicy.html',
                        controller: 'privacypolicy as vm'
                    },
                    "navbar@privacypolicy": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }*/
            },

            {
                name: 'cutomertos',
                url: '/terms-of-service/customers',
                parent: 'layout',
                templateUrl: 'app/layout/Partials/customertos.html',
                controller: 'customertos as vm'
                /*views: {
                    "@": {
                        templateUrl: 'app/layout/Partials/customertos.html',
                        controller: 'customertos as vm'
                    },
                    "navbar@cutomertos": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }*/
            },

            {
                name: 'promotertos',
                url: '/terms-of-service/promoters',
                parent: 'layout',
                templateUrl: 'app/layout/Partials/promotertos.html',
                controller: 'promotertos as vm'
                /*views: {
                    "@": {
                        templateUrl: 'app/layout/Partials/promotertos.html',
                        controller: 'promotertos as vm'
                    },
                    "navbar@promotertos": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }*/
            },

          {
                name: 'mybusiness',
                url: '/mybusiness',
                parent: 'layout',
                templateUrl: 'app/layout/Partials/mybusiness.html',
                controller: 'mybusiness as vm'
            },
          {
                name: 'promoterconsole',
                url: '/promoterconsole',
                parent: 'layout',
                templateUrl: 'app/promoters/Partials/promoterconsole.html',
                controller: 'promoterconsole as vm'
            },
            {
                name: 'promotersignup',
                url: '/promotersignup',
                parent: 'layout',
                templateUrl: 'app/promoters/Partials/promotersignup.html',
                controller: 'promotersignup as vm'
                /*views: {
                    "@": {
                        templateUrl: '',
                        controller: ''
                    },
                    "navbar@promotersignup": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }*/
            },  
            {
                name: 'favs',
                parent: 'layout',
                url: '/favs',
                templateUrl: 'app/layout/Partials/favs.html',
                controller: 'favs as vm'
            },

            {
                name: 'feeds',
                parent: 'layout',
                //abstract: true,
                url: '/feeds', ///cwrapper',
                templateUrl: 'app/layout/Partials/feeds.html',
                controller: 'feeds as vm'
            },
            {
                name: 'trends',
                parent: 'layout',
                //abstract: true,
                url: '/trends', ///cwrapper',
                templateUrl: 'app/layout/Partials/trends.html',
                controller: 'trends as vm'
            },

        ];

        $(states).each(function () {

            $stateProvider.state(this);
        });

        $locationProvider.html5Mode(true);
        // $locationProvider.hashPrefix('!');
        
    }
})();
