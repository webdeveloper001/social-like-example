angular.module('app').directive('searchBlock', ['$rootScope', '$state', 'search', '$timeout',function ($rootScope, $state, search, $timeout) {
    'use strict';

    return {
        templateUrl: 'app/content/partials/search-block.html',
        transclude: true,
        scope: {
            query: '@',
            ans: '=',
            ranks: '=',
            length: '=',
        },
        controller: ['$scope',
            
            function contentCtrl($scope) {
 
            }], //end controller
        link: function (scope) {
            scope.rankSel = function (x,nm) {
                if (nm) $rootScope.rankIsNearMe = true;
                else $rootScope.rankIsNearMe = false;
                if ($rootScope.editMode) $state.go('editRanking', { index: x.slug });
                else {
                    $state.go('rankSummary', { index: x.slug });
                }
            };
            scope.ansSel = function (x) {
                $rootScope.cCategory = undefined;
                $state.go('answerDetail', { index: x.slug });                
            };

            scope.resRanks = [];
            scope.resAnswers = [];
            scope.maxRes = 4000;
            
            var timeoutPromise;
            scope.$watch('query', function() {
                $timeout.cancel(timeoutPromise); //do nothing is timeout already done   
                timeoutPromise = $timeout(function(){
                    scope.getResults();
                },300);                                   
            });

            //Filter content based on user input
            scope.getResults = function() {

                scope.resRanks = [];
                if( scope.ranks) scope.resRanks = search.searchRanks(scope.query);
                scope.resAnswers = [];
                if( scope.ans) scope.resAnswers = search.searchAnswers(scope.query);
                for (var i=0; i<scope.resAnswers.length; i++){
                    if (scope.resAnswers[i].type == 'Establishment') scope.resAnswers[i].icon = 'fa fa-building-o';
                    if (scope.resAnswers[i].type == 'Person' || scope.resAnswers[i].type == 'PersonCust') scope.resAnswers[i].icon = 'fa fa-male';
                    if (scope.resAnswers[i].type == 'Short-Phrase') scope.resAnswers[i].icon = 'fa fa-comment-o';
                    if (scope.resAnswers[i].type == 'Event') scope.resAnswers[i].icon = 'fa fa-calendar-o';
                    if (scope.resAnswers[i].type == 'Organization') scope.resAnswers[i].icon = 'fa fa-trademark'; 
                }

                scope.length = scope.resRanks.length + scope.resAnswers.length;
                //console.log("scope.length - ", scope.length);                   
            }
            
        },
    }
}
    /*angular.module('app').directive('contentBlock', function() {
        */
]);