angular.module('app').directive('contentBlock', 
    ['$rootScope', '$state', 'answer', 'table', 'catans', '$timeout', 'vrows','$window','cblock','color','search',
    function ($rootScope, $state, answer, table, catans, $timeout, vrows, $window, cblock, color, search) {
    'use strict';

    return {
        templateUrl: 'app/content/partials/content-block.html',
        transclude: true,
        scope: {
            modType: '@type',
            isDynamic: '=dynamic',
            isRoW: '=rankofweek',
            updateView: '&updateView'
        },
        controller: ['$scope', 'query', '$http', 'answer', 'table', 'catans', '$timeout', 'vrows','$window','cblock','color','search',
            
            function contentCtrl($scope, query, $http, answer, table, catans, $timeout, vrows, $window, cblock, color, search) {
                var vm = $scope;
                vm.title = 'mycontent';

                vm.sm = $rootScope.sm;
                
                vm.maxRes = 4;

                vm.btext = 'see more';
                var strlen_o = 0;

                //Adjust picture size for very small displays
                if ($window.innerWidth < 768) vm.thumbheight = '80px';
                if ($window.innerWidth >= 768 && $window.innerWidth < 992) vm.thumbheight = '100px';
                if ($window.innerWidth >= 992 && $window.innerWidth < 1200) vm.thumbheight = '80px';
                if ($window.innerWidth > 1200) vm.thumbheight = '100px';
 
            }], //end controller
        link: function (scope) {

            if (scope.isDestroyed == undefined){
                    if (scope.modType == 'rankofweek') getRankofDay();
                    else loadContent();
            }
           
            var loadNhListener = $rootScope.$on('loadNh', function (e) {
                    if (scope.modType == 'rankofweek') getRankofDay();
                    else loadContent();
                });

             var applyRuleListener = $rootScope.$on('applyRule', function (e) {
                    applyRule();
                });
            
            function getRankofDay(){
                    //Clear images:
                    scope.image1 = "/assets/images/noimage.jpg";
                    scope.image2 = "/assets/images/noimage.jpg";
                    scope.image3 = "/assets/images/noimage.jpg";
                    scope.isShortPhrase = false;
                    
                    //load colors and headline
                    for (var i = 0; i < $rootScope.headlines.length; i++) {
                        if ($rootScope.headlines[i].type == scope.modType) {
                            scope.bgc = $rootScope.headlines[i].bc;
                            scope.bgc2 = color.shadeColor(scope.bgc,0.5);
                            scope.fc = $rootScope.headlines[i].fc;
                            scope.headline = $rootScope.headlines[i].title;
                            break;
                        }
                    }

                    if ($rootScope.DEBUG_MODE) console.log("rankofday - ", $rootScope.rankofday[0]);

                    var searchVal = '';
                    var rt = '';
                    
                    //$rootScope.rankofday[0].main = 'Women\'s March';
                    if ($rootScope.isCity) searchVal = $rootScope.rankofday[0].main;
                    if ($rootScope.isNh) searchVal = $rootScope.rankofday[0].nh + ' ' + $rootScope.cnh;

                    scope.results = [];
                    //scope.content = $rootScope.content;
                    var valTags = searchVal.split(" ");

                    if ($rootScope.DEBUG_MODE) console.log("valTags _ ", valTags);

                    for (var j = 0; j < $rootScope.content.length; j++) {
                        //for (var j = 50; j < 60; j++) {
                        var r = true;
                        rt = $rootScope.content[j].title;
                        //check that all tags exist
                        for (var k = 0; k < valTags.length; k++) {
                            var tagCapitalized = valTags[k].charAt(0).toUpperCase() + valTags[k].slice(1);
                            var tagFirstLowered = valTags[k].charAt(0).toLowerCase() + valTags[k].slice(1);
                            /*
                            r = r && (rt.includes(valTags[k]) || rt.includes(valTags[k].toUpperCase()) || rt.includes(tagCapitalized) || rt.includes(tagFirstLowered));
                            */
                            r = r && ((rt.indexOf(valTags[k]) > -1) || (rt.indexOf(valTags[k].toUpperCase()) > -1) ||
                                (rt.indexOf(tagCapitalized) > -1) || (rt.indexOf(tagFirstLowered) > -1));

                        }
                        if (r) {
                            scope.results.push($rootScope.content[j]);
                            break;
                        }
                    }
                    //Copy without reference
                    var sc = JSON.parse(JSON.stringify(scope.results[0]));
                   //Check if photos exist for Rank of Week
                    if (scope.results.length > 0 && scope.results[0] != undefined) {
                        //If featured image exist, shift images, set bg-box with color and shade
                        if (scope.results[0].fimage != undefined && scope.results[0].fimage != '' 
                        && sc.image1url.indexOf('featuredImages')<0 ){
                            scope.image3 = sc.image2url;
                            scope.image2 = sc.image1url;
                            scope.image1 = sc.fimage;
                            scope.rdbc = scope.results[0].bc;
                            scope.rdfc = scope.results[0].fc;
                            scope.shade = scope.results[0].shade;
                        }
                        else{
                            var colors = color.defaultRankColor(scope.results[0]);
                            scope.rdbc = colors[0];
                            scope.rdfc = colors[1];
                            scope.shade = 4;
                            if (scope.results[0].image1url != undefined) scope.image1 = sc.image1url;
                            if (scope.results[0].image2url != undefined) scope.image2 = sc.image2url;
                            if (scope.results[0].image3url != undefined) scope.image3 = sc.image3url;
                        }                        
                    }
                    
                    //Check if results is Short-Phrase
                    if (scope.results[0].type == 'Short-Phrase'){
                        
                        scope.isShortPhrase = true;
                        
                        var sPVals1 = scope.image1.split("##");
                        scope.title1=sPVals1[0];
                        scope.addinfo1 =sPVals1[1];
                        
                        var sPVals2 = scope.image2.split("##");
                        scope.title2=sPVals2[0];
                        scope.addinfo2=sPVals2[1];
                        
                        var sPVals3 = scope.image3.split("##");
                        scope.title3=sPVals3[0];
                        scope.addinfo3 =sPVals3[1];                        
                    }
                    
                    scope.rankOfDay = scope.results[0].title;                    
                }

                //load content based on mode
                function loadContent() {

                    var catstr = '';
                    var idxs = [];
                    var nidx = 0;
                    var rankid = 0;
                    scope.results = [];
                    var bFound = false;

                    //load colors and headline
                    for (var i = 0; i < $rootScope.headlines.length; i++) {
                        if ($rootScope.headlines[i].type == scope.modType) {
                            scope.bgc = $rootScope.headlines[i].bc;
                            scope.bgc2 = color.shadeColor(scope.bgc,0.3);
                            scope.fc = $rootScope.headlines[i].fc;
                            scope.headline = $rootScope.headlines[i].title;
                            if ($rootScope.isNh &&
                                $rootScope.headlines[i].type != 'rxfeedback' &&
                                $rootScope.headlines[i].type != 'rxsuggestion') scope.headline = scope.headline + ' - ' + $rootScope.cnh;
                            break;
                        }
                    }
                
                    //load content 
                    for (var i = 0; i < $rootScope.cblocks.length; i++) {
                        if (($rootScope.cblocks[i].scope == 'city' && $rootScope.isCity) &&
                            ($rootScope.cblocks[i].type == scope.modType)) {
                            catstr = $rootScope.cblocks[i].catstr;
                            idxs = catstr.split(':');
                            shuffle(idxs);
                            for (var j = 0; j < idxs.length; j++) {
                                nidx = $rootScope.content.map(function(x) {return x.id; }).indexOf(Number(idxs[j]));
                                scope.results.push($rootScope.content[nidx]);
                            }
                            bFound = true;
                            break;
                        }

                        else if (($rootScope.cblocks[i].scope == 'nh' && $rootScope.isNh) &&
                            ($rootScope.cblocks[i].type == scope.modType) &&
                            ($rootScope.cblocks[i].scopename == $rootScope.cnh)) {
                            catstr = $rootScope.cblocks[i].catstr;
                            idxs = catstr.split(':');
                            shuffle(idxs);

                            for (var j = 0; j < idxs.length; j++) {
                                nidx = $rootScope.content.map(function(x) {return x.id; }).indexOf(Number(idxs[j])); 
                                scope.results.push($rootScope.content[nidx]);
                            }
                            bFound = true;
                            break;
                        }
                        else if ($rootScope.cblocks[i].scope == 'rx' && $rootScope.cblocks[i].type == scope.modType &&
                            $rootScope.cblocks[i].scopename == 'RankX') {
                            catstr = $rootScope.cblocks[i].catstr;
                            idxs = catstr.split(':');
                            for (var j = 0; j < idxs.length; j++) {
                                //scope.results.push($rootScope.content[idxs[j]]);
                                nidx = $rootScope.content.map(function(x) {return x.id; }).indexOf(Number(idxs[j])); 
                                scope.results.push($rootScope.content[nidx]);
                            }
                            bFound = true;
                            break;
                        }
                    }

                    //resLT6 is used to hide the <<see more>> choice
                    if (scope.results.length <= 6) scope.resLT6 = true;
                    else scope.resLT6 = false;

                    var resGT0 = (scope.results[0] != undefined);
                    scope.updateView(bFound && resGT0);

                    if (bFound && resGT0) scope.hideme = false;
                    else scope.hideme = true;
                    //
                    scope.resultsTop = [];
                    var resObj = {};
                    //var M = scope.results.length > 2 ? 3:scope.results.length;
                    var M = scope.results.length;
                    if (M > 0) {
                        for (var n = 0; n < M; n++) {
                            resObj = {};
                            resObj = JSON.parse(JSON.stringify(scope.results[n]));

                            //Set feautured image
                            if (scope.results[n].fimage != undefined && scope.results[n].fimage != '' ){
                                scope.results[n].image1url = scope.results[n].fimage; 
                            }

                            //Set only ranks with good images on front-page
                            if (scope.results[n].image1url != $rootScope.EMPTY_IMAGE && 
                                scope.results[n].image1url != undefined &&
                                scope.results[n].image1url != ''){
                                editTitle(resObj);
                                parseShortAnswer(resObj);
                                scope.resultsTop.push(resObj);
                            }
                            else {
                                //shift up results, move rank with bad images to end of array
                                for (var m = n; m < M-1; m++){
                                    scope.results[m] = scope.results[m+1]; 
                                }
                                scope.results[M-1] = resObj;
                            }
                            if (scope.resultsTop.length > 2 || scope.resultsTop.length == M ) {
                                scope.results = scope.results.slice(scope.resultsTop.length+1);
                                break;
                            }
                        }
                        //scope.results = scope.results.slice(M+1);
                    }                    
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

             function editTitle(x){
                    x.titlex = x.title.replace(' in San Diego','');
                    if (x.answers == 0 && x.type != 'Short-Phrase') x.image1url = "../../../assets/images/noimage.jpg";
                }

                function parseShortAnswer(x) {
                    //Check if results is Short-Phrase
                    if (x.type == 'Short-Phrase') {

                        x.isShortPhrase = true;
                        if (x.image1url != undefined) {
                            var sPVals1 = x.image1url.split("##");
                            x.title1 = sPVals1[0];
                            x.addinfo1 = sPVals1[1];
                        }
                        if (x.image2url != undefined) {
                            var sPVals2 = x.image2url.split("##");
                            x.title2 = sPVals2[0];
                            x.addinfo2 = sPVals2[1];
                        }
                        if (x.image3url != undefined) {
                            var sPVals3 = x.image3url.split("##");
                            x.title3 = sPVals3[0];
                            x.addinfo3 = sPVals3[1];
                        }
                    }
                }             

            scope.rankSel = function (x,nm) {
                if (nm) $rootScope.rankIsNearMe = true;
                else $rootScope.rankIsNearMe = false;
                if ($rootScope.editMode) $state.go('editRanking', { index: x.slug });
                else {
                    $state.go('rankSummary', { index: x.slug });
                }
            };
            scope.seeMore = function (maxRes, btext) {
                if (scope.maxRes == 4) {
                    scope.btext = 'see less';
                    scope.maxRes = 100;
                }
                else {
                    scope.btext = 'see more';
                    scope.maxRes = 4;
                }
                // scope.loadContent();
            }
            scope.updateView = function (bFound) {
                if (bFound) scope.hideme = false;
                else scope.hideme = true;
            }

            scope.$on('$destroy', loadNhListener); 
            scope.$on('$destroy', applyRuleListener);
            //scope.$on('$destroy', loadBlocksListener);
            scope.$on('$destroy',function(){
                scope.isDestroyed = true;
            });

            
             
        },
    }
}

]);