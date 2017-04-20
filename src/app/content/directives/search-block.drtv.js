angular.module('app').directive('searchBlock', ['$rootScope', '$state', function ($rootScope, $state) {
    'use strict';

    return {
        templateUrl: 'app/content/partials/search-block.html',
        transclude: true,
        scope: {},
        controller: ['$scope','search',
            
            function contentCtrl($scope,search) {
                var vm = $scope;
                vm.title = 'mysearch';

                vm.resRanks = [];
                vm.resAnswers = [];
                vm.maxRes = 4000;

                getResults();
                
                $rootScope.$on('getResults', function (e) {
                    getResults();
                });

                //Filter content based on user input
                function getResults() {
                    vm.resRanks = [];
                    vm.resRanks = search.searchRanks();
                    vm.resAnswers = [];
                    vm.resAnswers = search.searchAnswers();
                    for (var i=0; i<vm.resAnswers.length; i++){
                        if (vm.resAnswers[i].type == 'Establishment') vm.resAnswers[i].icon = 'fa fa-building-o';
                        if (vm.resAnswers[i].type == 'Person' || vm.resAnswers[i].type == 'PersonCust') vm.resAnswers[i].icon = 'fa fa-male';
                        if (vm.resAnswers[i].type == 'Short-Phrase') vm.resAnswers[i].icon = 'fa fa-comment-o';
                        if (vm.resAnswers[i].type == 'Event') vm.resAnswers[i].icon = 'fa fa-calendar-o';
                        if (vm.resAnswers[i].type == 'Organization') vm.resAnswers[i].icon = 'fa fa-trademark'; 
                    }                   
                }
                
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
        },
    }
}
    /*angular.module('app').directive('contentBlock', function() {
        */
]);