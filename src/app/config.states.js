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
                views: {
                    "@layout": {
                        templateUrl: 'app/layout/Partials/cwrapper.html',
                        controller: 'cwrapper as vm'
                    }
                }
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
                controller: 'editRanking as vm',
                resolve: {
                    rankings: ['table', function (table) {
                        return table.getTables().then(function (result) {

                            return result;
                        });
                    }]
                }
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
                controller: 'editAnswer as vm',

                resolve: {
                    answers: ['answer', function (answer) {
                        return answer.getAnswers().then(function (result) {
                            return result;
                        });
                    }],
                    edits: ['edit', function (edit) {

                        return edit.getEdits().then(function (result) {

                            return result;
                        });
                    }]
                }
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
                name: 'answerDetail',
                parent: 'layout',
                url: '/answerDetail/:index',
                templateUrl: 'app/answer/Partials/answerDetail.html',
                controller: 'answerDetail as vm',
            },
            {
                name: 'editvrows',
                parent: 'layout',
                url: '/editvrows',
                templateUrl: 'app/customer/Partials/editvrows.html',
                controller: 'editvrows as vm'
            },
            {
                name: 'match',
                parent: 'layout',
                url: '/match',
                templateUrl: 'app/rank/Partials/match.html',
                controller: 'match as vm',
                resolve: {

                    answers: ['answer', function (answer) {
                        return answer.getAnswers().then(function (result) {

                            return result;
                        });
                    }]
                }
            },
            {
                name: 'about',
                url: '/about',
                views: {
                    "@": {
                        templateUrl: 'app/layout/Partials/about.html',
                        controller: 'about as vm'
                    },
                    "navbar@about": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }
            },
            {
                name: 'privacypolicy',
                url: '/privacypolicy',
                views: {
                    "@": {
                        templateUrl: 'app/layout/Partials/privacypolicy.html',
                        controller: 'privacypolicy as vm'
                    },
                    "navbar@privacypolicy": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }
            },
            {
              name: 'mybiz',
              url: '/mybiz',
              views: {
                "@": {
                  templateUrl: 'app/layout/Partials/mybiz.html',
                  controller: 'mybiz as vm'
                },
                "navbar@mybiz": {
                  templateUrl: 'app/layout/Partials/navbar.html',
                  controller: 'navbar as vm'
                }
            }
          },
          /*{
              name: 'mybusiness',
              parent: 'layout',
              url: '/mybusiness',
              templateUrl: 'app/layout/Partials/mybusiness.html',
              controller: 'mybusiness as vm'
          },*/
          {
                name: 'mybusiness',
                url: '/mybusiness',
                views: {
                    "@": {
                        templateUrl: 'app/layout/Partials/mybusiness.html',
                        controller: 'mybusiness as vm'
                    },
                    "navbar@mybusiness": {
                        templateUrl: 'app/layout/Partials/navbar.html',
                        controller: 'navbar as vm'
                    }
                }
            },
          {
                name: 'myfavs',
                parent: 'layout',
                url: '/myfavs',
                templateUrl: 'app/layout/Partials/myfavs.html',
                controller: 'myfavs as vm'
          }
        ];

        $(states).each(function () {

            $stateProvider.state(this);
        });

        //$locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');
        
    }
})();
