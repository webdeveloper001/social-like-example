angular.module('app').directive('rankItem', 
    ['$rootScope', '$state', 'answer', 'table', 'catans', '$timeout', 'vrows','$window','cblock','color','search',
    function ($rootScope, $state, answer, table, catans, $timeout, vrows, $window, cblock, color, search) {
    'use strict';

    return {
        templateUrl: 'app/content/partials/rank-block.html',
        transclude: true,
        scope: {
            rankObject: '='
        },
        controller: ['$scope', 'query', '$http', 'answer', 'table', 'catans', '$timeout', 'vrows','$window','cblock','color','search',
            
            function contentCtrl($scope, query, $http, answer, table, catans, $timeout, vrows, $window, cblock, color, search) {
                var vm = $scope;
                vm.title = 'mycontent';

                vm.sm = $rootScope.sm;

                //Adjust picture size for very small displays
                if ($window.innerWidth < 768) vm.thumbheight = '80px';
                if ($window.innerWidth >= 768 && $window.innerWidth < 992) vm.thumbheight = '100px';
                if ($window.innerWidth >= 992 && $window.innerWidth < 1200) vm.thumbheight = '80px';
                if ($window.innerWidth > 1200) vm.thumbheight = '100px';
 
            }], //end controller
        link: function (scope) {

            if (scope.isDestroyed == undefined){
                   loadContent();
            }
                        
                //load content based on mode
                function loadContent() {

                    var catstr = '';
                    var idxs = [];
                    var nidx = 0;
                    var rankid = 0;
                    scope.results = [];
                    var bFound = false;

                    var w = $window.innerWidth-20;
                    scope.w2 = Math.round(w/2);
                    scope.w4 = Math.round(w/4)-5;
                    scope.w8 = Math.round(w/8); 


                    
                    //
                    scope.resultsTop = [];
                    var resObj = {};

                    resObj = {};
                    resObj = JSON.parse(JSON.stringify(scope.rankObject));

                    // if (scope.rankObject.image1url != $rootScope.EMPTY_IMAGE && 
                    //     scope.rankObject.image1url != undefined &&
                    //     scope.rankObject.image1url != ''){
                        editTitle(resObj);
                        parseShortAnswer(resObj);
                        // if (resObj.type != 'Short-Phrase' || resObj.fimage != undefined){
                            scope.resultsTop.push(resObj);
                        // }
                    // }

                    
                    var tr = scope.resultsTop[0]; //top result
                    scope.title = tr.title;
                    
                    //Get rank stats
                    scope.stats = {};
                    scope.stats.views = tr.views;
                    scope.stats.answers = tr.answers;
                    scope.stats.numcom = tr.numcom;

                    if (scope.stats.numcom == undefined || scope.stats.numcom == null )
                    scope.stats.numcom = 0;

                    scope.isBasic = true;
                    

                    //Set Feautured Image && box color
                if (tr.fimage != undefined && tr.fimage != ''){
                    scope.image4 = tr.image3url;
                    scope.image3 = tr.image2url;
                    scope.image2 = tr.image1url;
                    scope.image1 = tr.fimage;
                    scope.bc = tr.bc;
                    scope.fc = tr.fc;
                    scope.shade = tr.shade;              
                }
                else{
                    //Set colors for title hideInfoBox
                    var colors = color.defaultRankColor(tr);
                    scope.bc = colors[0];
                    scope.fc = colors[1];
                    /*var x = Math.floor(Math.random() * 6) + 1;
                    if (x == 1) {scope.bc = 'brown'; scope.fc = '#f8f8ff'; }
                    if (x == 2) {scope.bc = '#4682b4'; scope.fc = '#f8f8ff'; }
                    if (x == 3) {scope.bc = '#008080'; scope.fc = '#f8f8ff'; }
                    if (x == 4) {scope.bc = 'gray'; scope.fc = '#f8f8ff'; }
                    if (x == 5) {scope.bc = '#a3297a'; scope.fc = '#f8f8ff'; }
                    if (x == 6) {scope.bc = '#c68c53'; scope.fc = '#f8f8ff'; }
    */
                    scope.shade = -4;
                    scope.image3 = tr.image3url;
                    scope.image2 = tr.image2url;
                    scope.image1 = tr.image1url;
                } 
                                        
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
           
            scope.$on('$destroy',function(){
                scope.isDestroyed = true;
            });
             
        },
    }
}

]);