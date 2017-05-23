angular.module('app').directive('trendBlock', 
    ['$rootScope', '$state', 'answer', 'table', 'catans', '$timeout', 'vrows','$window','cblock','color','search',
    function ($rootScope, $state, answer, table, catans, $timeout, vrows, $window, cblock, color, search) {
    'use strict';

    return {
        templateUrl: 'app/content/partials/trend-block.html',
        transclude: true,
        scope: {
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
                //   loadContent();
            }   
                
                scope.seeTab = function(x){
                    if (x == 1){
                        scope.popular = true;
                        scope.newest = false;
                    }
                    if (x == 2){
                        scope.newest = true;
                        scope.popular = false;
                    }
                };

                scope.seeTab(1); 
                loadContent()
                //load content based on mode
                function loadContent() {
                    var res = angular.copy($rootScope.content.filter(function(ranking){ return ranking.ismp == 1;}));
                    res.sort(function(ranking1, ranking2){
                        var view1 = ranking1.views ? ranking1.views : 0;
                        var view2 = ranking2.views ? ranking2.views : 0;
                        if( ranking1.id == ranking2.id )
                            return 0;

                        return view1 < view2 ? 1 : -1;
                    })

                    scope.popularOrder = res.slice(0, 8);

                    res.sort(function(ranking1, ranking2){
                        var view1 = ranking1.timestmp ? ranking1.timestmp : 0;
                        var view2 = ranking2.timestmp ? ranking2.timestmp : 0;
                        if( ranking1.id == ranking2.id )
                            return 0;

                        return view1 < view2 ? 1 : -1;
                    })
                    scope.newestOrder = res.slice(0, 8);
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