angular.module('app').directive('answerItem', 
    ['$rootScope', '$state', 'answer', 'table', 'catans', '$timeout', 'vrows','$window','cblock','color','search',
    function ($rootScope, $state, answer, table, catans, $timeout, vrows, $window, cblock, color, search) {
    'use strict';

    return {
        templateUrl: 'app/content/partials/answer-block.html',
        transclude: true,
        scope: {
            answerObject: '='
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

                    var w = $window.innerWidth-20;
                    scope.w2 = Math.round(w/2);
                    scope.w4 = Math.round(w/4)-5;
                    scope.w8 = Math.round(w/8); 

                    var resObj = {};

                    resObj = {};
                    resObj = JSON.parse(JSON.stringify(scope.answerObject));
                    scope.answer = resObj;
                    
                    if (resObj.type == 'Short-Phrase') parseShortAnswer(resObj);
                    
                    //Get rank stats
                    scope.stats = {};
                    scope.stats.views = resObj.views;
                    scope.stats.answers = resObj.answers;
                    scope.stats.numcom = resObj.numcom;

                    if (scope.stats.numcom == undefined || scope.stats.numcom == null )
                    scope.stats.numcom = 0;

                     //Choose color randomly
                    var x = Math.floor(Math.random() * 5) + 1;
                    if (x == 1) {scope.bc = 'brown'; scope.fc = '#f8f8ff'; }
                    if (x == 2) {scope.bc = '#4682b4'; scope.fc = '#f8f8ff'; }
                    if (x == 3) {scope.bc = '#008080'; scope.fc = '#f8f8ff'; }
                    if (x == 4) {scope.bc = 'gray'; scope.fc = '#f8f8ff'; }
                    //if (x == 5) {scope.bc = '#a3297a'; scope.fc = '#f8f8ff'; }
                    if (x == 5) {scope.bc = '#c68c53'; scope.fc = '#f8f8ff'; }
    
                    scope.shade = -4;
                    if (resObj.imageurl != undefined && resObj.imageurl != '' && resObj.imageurl != null)
                    scope.image1 = resObj.imageurl;
                    else
                    scope.image1 = $rootScope.EMPTY_IMAGE;

                    if (resObj.type == 'Short-Phrase') scope.image1 = $rootScope.EMPTY_IMAGE;
                    
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

            scope.ansSel = function (x) {
                $state.go('answerDetail', { index: x.slug });                
            };
           
            scope.$on('$destroy',function(){
                scope.isDestroyed = true;
            });
             
        },
    }
}

]);