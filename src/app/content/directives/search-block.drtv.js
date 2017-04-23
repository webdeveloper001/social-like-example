angular.module('app').directive('searchBlock', ['$rootScope', '$state', 'search',function ($rootScope, $state, search) {
    'use strict';

    return {
        templateUrl: 'app/content/partials/search-block.html',
        transclude: true,
        scope: {},
        controller: ['$scope',
            
            function contentCtrl($scope) {
 
            }], //end controller
        link: function (scope) {
            scope.rankSel = function (x,nm) {
                if (nm) $rootScope.rankIsNearMe = true;
                else $rootScope.rankIsNearMe = false;
                if ($rootScope.editMode) $state.go('editRanking', { index: x.id });
                else {
                    $state.go('rankSummary', { index: x.id });
                }
            };
            scope.ansSel = function (x) {
                $state.go('answerDetail', { index: x.id });                
            };

            scope.resRanks = [];
            scope.resAnswers = [];
            scope.maxRes = 4000;

            var searchListener = $rootScope.$on('getResults', function (e) {
                    scope.getResults();
            });

                //Filter content based on user input
                scope.getResults = function() {
                    scope.resRanks = [];
                    scope.resRanks = search.searchRanks();
                    scope.resAnswers = [];
                    scope.resAnswers = search.searchAnswers();
                    for (var i=0; i<scope.resAnswers.length; i++){
                        if (scope.resAnswers[i].type == 'Establishment') scope.resAnswers[i].icon = 'fa fa-building-o';
                        if (scope.resAnswers[i].type == 'Person' || scope.resAnswers[i].type == 'PersonCust') scope.resAnswers[i].icon = 'fa fa-male';
                        if (scope.resAnswers[i].type == 'Short-Phrase') scope.resAnswers[i].icon = 'fa fa-comment-o';
                        if (scope.resAnswers[i].type == 'Event') scope.resAnswers[i].icon = 'fa fa-calendar-o';
                        if (scope.resAnswers[i].type == 'Organization') scope.resAnswers[i].icon = 'fa fa-trademark'; 
                    }                   
                }

            scope.$on('$destroy', searchListener);            
        },
    }
}
    /*angular.module('app').directive('contentBlock', function() {
        */
]);