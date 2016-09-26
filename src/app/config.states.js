(function () {
    'use strict';

    var app = angular.module('app');

    // Configure the states and state resolvers
    app.config(['$stateProvider', '$urlRouterProvider', stateConfigurator]);

    function stateConfigurator($stateProvider, $urlRouterProvider) {


        // For any unmatched url
        $urlRouterProvider.otherwise('/cwrapper');

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
                url: '', ///cwrapper',
                views: {
                    "@layout": {
                        templateUrl: 'app/layout/Partials/cwrapper.html',
                        controller: 'cwrapper as vm'
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
                    }],

                    specials: ['special', function (special) {
                        return special.getSpecials().then(function (result) {

                            return result;
                        });
                    }],
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
                    }],
                    allvrows: ['vrows', function (vrows) {

                        return vrows.getAllvrows().then(function (result) {
                            
                            return result;
                        });
                    }],
                    headlines: ['headline', function (headline) {

                        return headline.getheadlines().then(function (result) {
                            
                            return result;
                        });
                    }],
                    cblocks: ['cblock', function (cblock) {

                        return cblock.getcblocks().then(function (result) {
                            
                            return result;
                        });
                    }]                   
                }
            },

            {
                name: 'rankSummary',
                parent: 'layout',
                url: '/rankSummary/:index',
                templateUrl: 'app/rank/Partials/RankSummary.html',
                controller: 'rankSummary as vm',

                resolve: {
                     
                    answers: ['answer', function (answer) {
                        return answer.getAnswers().then(function (result) {

                            return result;
                        });
                    }],

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
                    }],
                    allvrows: ['vrows', function (vrows) {

                        return vrows.getAllvrows().then(function (result) {
                            
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
                name: 'fileuploadtest',
                url: '/fileuploadtest',
                views: {
                    "@": {
                        templateUrl: 'app/layout/Partials/fileuploadtest.html',
                        controller: 'fileuploadtest'
                    },
                    "navbar@fileuploadtest": {
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