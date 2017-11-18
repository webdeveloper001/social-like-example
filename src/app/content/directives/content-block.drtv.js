angular.module('app').directive('contentBlock', ['$rootScope', '$state', 'search', '$timeout', '$window',
function ($rootScope, $state, search, $timeout, $window) {
    'use strict';

    return {
        templateUrl: 'app/content/partials/content-block.html',
        transclude: true,
        scope: {
            query: '@',
            ans: '=',
            ranks: '=',
            length: '=',
        },
        controller: ['$scope',
            
            function contentCtrl($scope) {

                //Adjust picture size for very small displays
                if ($window.innerWidth < 768) { $scope.itemWidth = ($window.innerWidth - 8)/2; }
                if ($window.innerWidth >= 768 && $window.innerWidth < 992) { $scope.itemWidth = ($window.innerWidth - 8)/3; }
                if ($window.innerWidth >= 992 && $window.innerWidth < 1200) { $scope.itemWidth = ($window.innerWidth - 8)/4; }
                if ($window.innerWidth > 1200) { $scope.itemWidth = ($window.innerWidth - 8)/6; }
            }], //end controller
        link: function (scope) {

            scope.rankSel = function (x,nm) {
                scope.disableScrolling = true;
                //console.log("scope.disableScrolling = ", scope.disableScrolling);
                if (x.useTemp){
                if (nm) $rootScope.rankIsNearMe = true;
                else $rootScope.rankIsNearMe = false;
                var selectedRank = {};
                for (var i=0; i<$rootScope.content.length; i++){
                    if (x.id == $rootScope.content[i].cat){
                        if (x.locationId == $rootScope.content[i].nh) selectedRank = $rootScope.content[i];
                    }
                }
                
                if(selectedRank.id == undefined){
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

                    var ghostRank = {
                        id: maxId,  //TODO when add to db, should delete id and update slug.
                        catstr: '' + maxId,
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
                        image1url: $rootScope.EMPTY_IMAGE,
                        image2url: $rootScope.EMPTY_IMAGE,
                        image3url: $rootScope.EMPTY_IMAGE,
                        answertags: '',
                        isatomic: 1, //TODO decide isatomic, numcom, ismp, owner, 
                        timestmp: new Date(),
                        cat: x.id,
                        nh: x.locationId,
                    }
                    
                    $rootScope.content.push(ghostRank);
                    //update searchString to keep array lengths in sync
                    $rootScope.searchStrContent.push(ghostRank.tags ? ghostRank.tags : '') + " " + (ghostRank.title ? ghostRank.title : '');

                    $state.go('rankSummary', { index: slug });
                } else {
                    if ($rootScope.editMode) $state.go('editRanking', { index: selectedRank.slug });
                    else {
                        $state.go('rankSummary', { index: selectedRank.slug });
                    }
                }
            }
            else {
                if ($rootScope.editMode) $state.go('editRanking', { index: x.slug });
                else $state.go('rankSummary', { index: x.slug });                  
            }
            };
            scope.ansSel = function (x) {
                $rootScope.cCategory = undefined;
                scope.disableScrolling = true;
                //console.log("scope.disableScrolling = ", scope.disableScrolling);
                $state.go('answerDetail', { index: x.slug });                
            };

            scope.resRanks = [];
            scope.resAnswers = [];
            scope.searchResults = [];
            scope.maxRes = 4000;
            
            var timeoutPromise;
            scope.$watch('query', function() {
                $timeout.cancel(timeoutPromise); //do nothing is timeout already done   
                timeoutPromise = $timeout(function(){
                //console.time('stime - ', scope.query);
                scope.getResults();
                //console.timeEnd('etime - ', scope.query);
                    
                },300);                                   
            });

            //Filter content based on user input
            scope.getResults = function() {
                scope.useTemp = false;
                scope.resRanks = [];
                var catRanks = [];
                if( scope.ranks) {
                    catRanks = [];
                    scope.resRanks = search.searchRanks2(scope.query);
                    catRanks = search.searchRanks(scope.query);
                    var catmap = scope.resRanks.map(function(x) {return x.cat; });
                    
                    for (var i = 0; i < catRanks.length; i++){
                        if (catmap.indexOf(catRanks[i].id) < 0) {
                            scope.resRanks.push(catRanks[i]);
                        }
                    }
                    
                    if (scope.resRanks.length > 0){
                        scope.disableScrolling = false;
                        scope.currentIndex = scope.intialDataCount;
                        scope.startIndex = 0;
                        scope.endReached = false;
                        //scope.loadMore();
                    }
                }

                scope.length = scope.resRanks.length + scope.resAnswers.length;
                scope.searchResults = scope.resRanks;
            }

            scope.currentIndex = 0;
            scope.startIndex = 0;
            if($rootScope.sm){
                scope.scrollingItemsOnePage = 6;
                scope.loadingCountOneScroll = 3;
            }
            else{
                scope.loadingCountOneScroll = 6;
                scope.scrollingItemsOnePage = 6;
            }
            scope.scrollingItemsOnePage = 1000;
            scope.scrollingData = [];
            scope.scrollDataLoading = false;
            scope.content = [];
            scope.intialDataCount = 12;
            scope.endReached = false;
            scope.disableScrolling = true;
            //console.log("scope.disableScrolling = ", scope.disableScrolling);
            scope.scrollingData = [];
            scope.uniqueResult = [];
            loadInifiniteScroll(true);

            scope.loadMore = function () {
                //console.log("loadMore --",scope.startIndex, scope.currentIndex, scope.searchResults.length );

                scope.scrollDataLoading = true;
                
                $timeout(function () {
                
                scope.currentIndex = scope.currentIndex + 12;
                if (scope.currentIndex >= scope.searchResults.length) {
                    
                    //console.log("end reached - ");
                    scope.endReached = true;
                }
                if((scope.currentIndex - scope.startIndex) > scope.scrollingItemsOnePage){
                    scope.startIndex = scope.currentIndex - scope.scrollingItemsOnePage;        
                } 
                    scope.scrollDataLoading = false;
                }, 500);
            }

            function loadInifiniteScroll(reloading) {
                //console.log("loadingInfiniteScroll --");

                scope.currentIndex = 12;
                scope.startIndex = 0;
                scope.loadingCountOneScroll = 6;
                scope.scrollingData = [];
                scope.scrollDataLoading = false;
                scope.content = [];
                scope.endReached = false;
                scope.scrollingData = [];

            }
            
        },
    }
    /*angular.module('app').directive('contentBlock', function() {
        */
}
]);