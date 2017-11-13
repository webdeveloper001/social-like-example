angular.module('app').directive('searchBlock', ['$rootScope', '$state', 'search', '$timeout', '$window','dataloader',
function ($rootScope, $state, search, $timeout, $window, dataloader) {
    'use strict';

    return {
        templateUrl: 'app/content/partials/search-block.html',
        transclude: true,
        scope: {
            query: '@',
            ans: '=',
            ranks: '=',
            length: '=',
            init: '=',
            data: '=',
            rod: '=',
            scrollactive: '=',
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

            var pullDataArray = [];
            var homeRanks = [];
            var ranksLoaded = false;

            var _currentOffset = -1;
            var _lastOffset = -1;
            var _loadMoreThreshold = 0;
            var _renderTime = 0;

            scope.contentLoaded = false;
            
            if ($rootScope.DISPLAY_XSMALL == true) _loadMoreThreshold = 400;
            if ($rootScope.DISPLAY_SMALL == true) _loadMoreThreshold = 400;
            if ($rootScope.DISPLAY_MEDIUM == true) _loadMoreThreshold = 400;
            if ($rootScope.DISPLAY_LARGE == true) _loadMoreThreshold = 300;

            if ($rootScope.DISPLAY_XSMALL == true || $rootScope.DISPLAY_SMALL == true) _renderTime = 1000;
            if ($rootScope.DISPLAY_MEDIUM == true || $rootScope.DISPLAY_LARGE == true) _renderTime = 1000;
            
            scope.rankSel = function (x,nm) {
                
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
                    if ($rootScope.DEBUG_MODE) console.log("Rank is Ghost");

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
                    if ($rootScope.DEBUG_MODE) console.log("ghostRank - ", ghostRank);
                    $rootScope.content.push(ghostRank);
                    //update searchString to keep array lengths in sync
                    $rootScope.searchStrContent.push(ghostRank.tags ? ghostRank.tags : '') + " " + (ghostRank.title ? ghostRank.title : '');
                    $state.go('rankSummary', { index: slug });
                } else {
                    if ($rootScope.DEBUG_MODE) console.log("rank is normal ", selectedRank);
                    if ($rootScope.editMode) $state.go('editRanking', { index: selectedRank.slug });
                    else {
                        $state.go('rankSummary', { index: selectedRank.slug });
                    }
                }
            }
            else {
                if ($rootScope.editMode) $state.go('editRanking', { index: x.slug });
                else {
                    $state.go('rankSummary', { index: x.slug });
                }                  
            }
            };
            scope.ansSel = function (x) {
                $rootScope.PAGEYOFFSET =  window.pageYOffset;
                $rootScope.cCategory = undefined; //clear current category
                //scope.disableScrolling = true;
                $state.go('answerDetail', { index: x.slug });                
            };

            scope.resRanks = [];
            scope.resAnswers = [];
            scope.searchResults = [];
            scope.displayResults = [];
            scope.maxRes = 4000;
            
            var timeoutPromise;
            scope.$watch('query', function() {
                if (ranksLoaded) queryPreamble();
                else scope.contentLoaded = false;
            });

            $rootScope.$on('updateSearch', function(){
                queryPreamble()
            })

            function queryPreamble(){
                 $timeout.cancel(timeoutPromise); //do nothing is timeout already done   
                    timeoutPromise = $timeout(function () {
                        if (scope.query.length >= 2) {
                            scope.disableScrolling = false;
                            scope.endReached = false;
                            scope.getResults(scope.query);
                            
                        }
                        if (scope.query.length == 0) {
                            var temp = homeRanks.map(function(rank){
                                if (rank.id == $rootScope.updated_rank_id) {
                                    $rootScope.content.map(function(x){
                                        if (x.id == $rootScope.updated_rank_id) {
                                            return rank = angular.copy(x)
                                        }
                                    })
                                }
                                return rank;
                            });
                            homeRanks = temp;
                            scope.searchResults = homeRanks;
                            scope.endReached = false;
                            scope.displayResults = scope.searchResults.slice(0, scope.scrollingItemsOnePage);
                        }
                    }, 300);
            }

            //Filter content based on user input
            scope.getResults = function() {
                scope.useTemp = false;
                scope.resRanks = [];
                var catRanks = [];
                //if( scope.resRanks.length > 0) {
                //    catRanks = [];
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
                //}
                scope.resAnswers = [];
                if(scope.ans) scope.resAnswers = search.searchAnswers(scope.query);
                for (var i=0; i<scope.resAnswers.length; i++){
                    scope.resAnswers[i].isAnswer = true;
                    if (scope.resAnswers[i].type == 'Establishment') {
                        scope.resAnswers[i].itext = 'Establishment';
                        scope.resAnswers[i].icon = 'fa fa-building-o';

                    }
                    if (scope.resAnswers[i].type == 'Person'){
                        scope.resAnswers[i].itext = 'Public Figure'; 
                        scope.resAnswers[i].icon = 'fa fa-male';
                    }
                    if (scope.resAnswers[i].type == 'PersonCust'){
                        scope.resAnswers[i].itext = 'Contractor'; 
                        scope.resAnswers[i].icon = 'fa fa-male';
                    }
                    if (scope.resAnswers[i].type == 'Short-Phrase') {
                        scope.resAnswers[i].itext = 'Opinion';
                        scope.resAnswers[i].icon = 'fa fa-comment-o';
                    }
                    if (scope.resAnswers[i].type == 'Event') {
                        scope.resAnswers[i].itext = 'Event';
                        scope.resAnswers[i].icon = 'fa fa-calendar-o';
                    }
                    if (scope.resAnswers[i].type == 'Organization') {
                        scope.resAnswers[i].itext = 'Brand';
                        scope.resAnswers[i].icon = 'fa fa-trademark';
                    }
                    if (scope.resAnswers[i].type == 'Place') {
                        scope.resAnswers[i].itext = 'Place';
                        scope.resAnswers[i].icon = 'fa fa-map-marker';
                    } 
                }

                scope.length = scope.resRanks.length + scope.resAnswers.length;
                scope.searchResults = scope.resRanks.concat(scope.resAnswers);
                scope.displayResults = scope.searchResults.slice(0,scope.scrollingItemsOnePage);
                pullDataArray = scope.displayResults;
                var ranksRes = [];
                var answerRes = []; 
                for (var i=0; i<scope.displayResults.length; i++){
                    if (scope.displayResults[i].isAnswer) answerRes.push(scope.displayResults[i]);
                    else ranksRes.push(scope.displayResults[i]);
                }
                if (ranksRes.length > 0) pullData('ranks', ranksRes);
                if (answerRes.length > 0) pullData('answers', answerRes);
                
                scope.relTags = search.searchRelatedRanks(ranksRes, scope.query);
                scope.relTagsIdx = 0;
                
                
                if (scope.searchResults.length < 3) {
                    //console.log("scrolling disabled");
                    scope.disableScrolling = true;
                }
                else scope.disableScrolling = false;
                scope.loadMore(true)
                //$timeout(function(){
                //    $rootScope.$broadcast('masonry.reload');
                //});                
            }

            var timeoutPromise2;
            scope.$watch('init', function() {
                $timeout.cancel(timeoutPromise2); //do nothing is timeout already done   
                timeoutPromise2 = $timeout(function(){
                    if (scope.init) scope.getContent();
                },50);                                   
            });

            //Get content on loading
            scope.getContent = function () {
                homeRanks = [];

                if ($rootScope.content.length < 50)
                    homeRanks = JSON.parse(JSON.stringify($rootScope.content));
                else {
                    $rootScope.content.forEach(function (item) {
                        if (item.ismp) homeRanks.push(item);
                    });
                }

                if (homeRanks.length > 0) {
                    shuffle(homeRanks);
                    scope.disableScrolling = false;
                    scope.currentIndex = scope.intialDataCount;
                    scope.startIndex = 0;
                    scope.endReached = false;
                }
                ranksLoaded = false;
                scope.searchResults = homeRanks;
                scope.displayResults = scope.searchResults.slice(0, scope.scrollingItemsOnePage);
                pullDataArray = scope.searchResults.slice(0, scope.scrollingItemsOnePage);
                pullData('ranks', pullDataArray);
                scope.contentLoaded = true;
                scope.loadMore(true)
            }

            var timeoutPromise3;
            scope.$watch('data', function() {
                $timeout.cancel(timeoutPromise3); //do nothing is timeout already done   
                timeoutPromise3 = $timeout(function(){
                    if (scope.data) scope.addContent();
                },50);                                   
            });

            scope.addContent = function(){
                
                var map = homeRanks.map(function(x) {return x.id; });
                
                $rootScope.content.forEach(function(ranking){
                    if (map.indexOf(ranking.id) < 0 && ranking.ismp) homeRanks.push(ranking);                    
                });
                
                scope.searchResults = JSON.parse(JSON.stringify(homeRanks));
                ranksLoaded = true;
                scope.contentLoaded = true;
                queryPreamble();  
            }

            var timeoutPromise4;
            scope.$watch('rod', function () {
                $timeout.cancel(timeoutPromise4); //do nothing is timeout already done   
                timeoutPromise4 = $timeout(function () {
                    if (scope.rod == true) {
                        if ($rootScope.rankofday) {
                            var obj = $rootScope.rankofday;
                            obj[0].isrod = true;
                            homeRanks[0] = obj[0];
                            scope.displayResults[0] = obj[0];
                        }
                    }
                }, 50);
            });

            scope.$watch('scrollactive', function() {
                scope.disableScrolling = !scope.scrollactive;
                if (!scope.disableScrolling && scope.displayResults.length < 20) $rootScope.$broadcast('masonry.reload');                                   
            });

            if($rootScope.sm){
                scope.scrollingItemsOnePage = 6;
                scope.loadingCountOneScroll = 3;
            }
            else{
                scope.loadingCountOneScroll = 6;
                scope.scrollingItemsOnePage = 12;
            }
            scope.scrollingItemsOnePage = 12;
            scope.scrollingData = [];
            scope.scrollDataLoading = false;
            scope.content = [];
            scope.intialDataCount = $rootScope.numInitItems;
            scope.endReached = false;
            scope.disableScrolling = true;
            scope.scrollingData = [];
            scope.uniqueResult = [];
            loadInifiniteScroll(true);

            scope.loadMore = function (forceLoad) {
                //console.log("loadMore - ");
                _currentOffset = $window.pageYOffset;
                if (Math.abs(_currentOffset-_lastOffset)<_loadMoreThreshold && !forceLoad) {
                    //console.log("loadMore - doNothing");
                }
                else {
                    //console.log("loadMore - exec ", _currentOffset, forceLoad);
                    _lastOffset = _currentOffset;
                    if (scope.scrollactive) {
                        scope.scrollDataLoading = true;

                        //$timeout(function () {
                            //load next items onto displayResults array
                            var b = scope.displayResults.length;
                            pullDataArray = [];
                            for (var i = b; i < b + scope.scrollingItemsOnePage; i++) {
                                if (scope.searchResults[i]) {
                                    //if not already in display array, add it to display 
                                    var idx = scope.displayResults.map(function(x) {return x.id; }).indexOf(scope.searchResults[i].id);
                                    if (idx < 0) {
                                        scope.displayResults.push(scope.searchResults[i]);
                                        pullDataArray.push(scope.searchResults[i]);
                                    }
                                }
                            }

                            if (pullDataArray.length > 0) pullData('ranks', pullDataArray);
                            scope.scrollDataLoading = false;

                            //load more content
                            if ((scope.searchResults.length - scope.displayResults.length) < 12 && scope.relTags != undefined) {
                                if (scope.relTags[scope.relTagsIdx] != undefined) {
                                    var moreRanks = search.searchRanks2(scope.relTags[scope.relTagsIdx].tag);
                                    scope.relTagsIdx++;
                                    //If new ranks do not exist already in results, add it
                                    moreRanks.forEach(function (nrank) {
                                        if (scope.searchResults.map(function (x) { return x.id; }).indexOf(nrank.id) < 0 &&
                                            nrank.ismp == true) {
                                            scope.searchResults.push(nrank);
                                        }
                                    });
                                    //scope.loadMore(true);
                                }
                            }

                            //add more related tags    
                            if (scope.relTags != undefined) {
                                if (scope.relTagsIdx == scope.relTags.length - 1) {
                                    //console.log("added more tags");
                                    scope.relTags = search.searchRelatedRanks(scope.searchResults, scope.query);
                                    scope.relTagsIdx = 0;
                                    //console.log("scope.relTags - ", scope.relTags);
                                }
                            }

                            if ((scope.displayResults.length == scope.searchResults.length) && ranksLoaded) {
                                if (scope.relTags != undefined) {
                                    if (scope.relTagsIdx == scope.relTags.length - 1) {
                                        scope.endReached = true;
                                    }
                                }
                                else scope.endReached = true;
                            }
                        //}, 0);
                        $timeout(function(){
                            $rootScope.$broadcast('masonry.reload');
                        },_renderTime);
                    }
                }
            }

            function pullData(type,data){
                    dataloader.pulldata(type, data);
            }

            function loadInifiniteScroll(reloading) {
                scope.currentIndex = 12;
                scope.startIndex = 0;
                scope.loadingCountOneScroll = 6;
                scope.scrollingData = [];
                scope.scrollDataLoading = false;
                scope.content = [];
                scope.endReached = false;
                scope.scrollingData = [];
            }

            function shuffle(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        }


            
        },
    }
    /*angular.module('app').directive('contentBlock', function() {
        */
}
]);