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
                var selectedRank = $rootScope.content.filter(function(ranking){
                    if(x.locationId == 1)
                        return (!ranking.nh || !x.id == 1)  && ranking.cat == x.id;
                    else {
                        return ranking.nh == x.locationId  && ranking.cat == x.id;
                    }
                });
                if(selectedRank.length == 0){
                    var maxId = 0;
                    $rootScope.content.forEach(function(ranking){
                        if(ranking.id > maxId)
                            maxId = ranking.id;
                    });
                    maxId ++;
                    var slug = x.title.toLowerCase();; 
                    slug = slug.replace(/ /g,'-');
                    slug = slug.replace('/','at');
                    slug = slug + '-' + maxId;

                    $rootScope.content.push({
                        id: maxId,  //TODO when add to db, should delete id and update slug.
                        slug: slug,
                        isGhost: true,
                        title: x.title,
                        type: x.type,
                        tags: x.tags,
                        keywords: x.keywords,
                        question: x.question,
                        fimage: x.fimage,
                        bc: x.bc,
                        fc: x.fc,
                        shade: x.shade,
                        introtext: x.introtext,
                        user: x.user ,
                        views: 0,
                        answers: 0,
                        image1url: '../../../assets/images/noimage.jpg',
                        image2url: '../../../assets/images/noimage.jpg',
                        image3url: '../../../assets/images/noimage.jpg',
                        answertags: '',
                        isatomic: 1, //TODO decide isatomic, numcom, ismp, owner, 
                        timestmp: new Date(),
                        cat: x.id,
                        nh: x.locationId,
                    });
                    $state.go('rankSummary', { index: slug });
                } else {
                    if ($rootScope.editMode) $state.go('editRanking', { index: selectedRank[0].slug });
                    else {
                        $state.go('rankSummary', { index: selectedRank[0].slug });
                    }
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
    /*angular.module('app').directive('contentBlock', function() {
        */
}
]);