(function () {
    'use strict';

    var app = angular.module('app');

    // Configure the states and state resolvers
    app.config(['$stateProvider', '$urlRouterProvider', stateConfigurator]);

    function stateConfigurator($stateProvider, $urlRouterProvider) {


        // For any unmatched url
        $urlRouterProvider.otherwise('/content');

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
                name: 'content',
                parent: 'layout',
                url: '/content',
                views: {
                    "@layout": {
                        templateUrl: 'app/content/partials/content.html',
                        controller: 'content as vm'
                    }
                },
                resolve: {

                    answers: ['answer', function (answer) {
                        return answer.getAnswers().then(function (result) {

                            return result;
                        });
                    }],
                    
                    rankings: ['table', function (table) {
                        return table.getTables().then(function (result) {

                            return result;
                        });
                    }]
                    /*
                    answers: ['answer', function () {
                        return function () {

                            return [];
                        };
                    }]*/
                }
            },


            {
                name: 'rankSummary',
                parent: 'content',
                url: '/rankSummary/:index',
                templateUrl: 'app/rank/Partials/RankSummary.html',
                controller: 'rankSummary as vm',
                
                resolve: {
                    
                    mrecs: ['matchrec', function (matchrec) {

                        return matchrec.GetMatchTable().then(function (result) {

                            return result;
                        });
                    }],
                    edits: ['edit', function (edit) {

                        return edit.getEdits().then(function (result) {

                            return result;
                        });
                    }],
                    useractivities: ['useractivity', function (useractivity) {

                        return useractivity.getAllUserActivity().then(function (result) {

                            return result;
                        });
                    }],
                    catansrecs: ['catans', function (catans) {

                        return catans.getAllcatans().then(function (result) {

                            return result;
                        });
                    }]
                    
                    /*
                    mrecs: ['matchrec', function () {
                        return function () {

                            return [];
                        };
                    }],
                    edits: ['edit', function () {
                        return function () {

                            return [];
                        };
                    }],
                    useractivities: ['useractivity', function () {
                        return function () {

                            return [];
                        };
                    }],
                    catansrecs: ['catans', function () {
                        return function () {

                            return [];
                        };
                    }]*/
                    
                }
            },
            {
                name: 'addAnswer',
                parent: 'content',
                url: '/addAnswer',
                templateUrl: 'app/answer/Partials/addAnswer.html',
                controller: 'addAnswer as vm'
            },
            {
                name: 'editAnswer',
                parent: 'content',
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
                name: 'answerDetail',
                parent: 'content',
                url: '/answerDetail/:index',
                templateUrl: 'app/answer/Partials/answerDetail.html',
                controller: 'answerDetail as vm',
                resolve: {
                    
                    answers: ['answer', function (answer) {
                        return answer.getAnswers().then(function (result) {

                            return result;
                        });
                    }]
                    
                    /*
                    answers: ['answer', function () {
                        return function () {

                            return [];
                        };
                    }]*/

                }
            },
            {
                name: 'match',
                parent: 'content',
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
            }
        ];

        $(states).each(function () {

            $stateProvider.state(this);
        });
    }
})();