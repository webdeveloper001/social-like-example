angular.module('app').directive('bgBox3', ['color','$timeout','$rootScope',function (color, $timeout, $rootScope) {
    'use strict';

    return {
        templateUrl: 'app/common/partials/bgbox3.html',
        transclude: true,
        scope: {
            bc: '@',
            bc2: '@',
            fc: '@',
            shade: '@',
            text: '@',
            dir: '@',
            stats: '@',
            w: '@',
            h: '@',
            introtext: '@',
            type: '@',
            imageurl: '@',
            isAnswer: '@'
        },
        link: function (scope) {

            
        $timeout(function(){
            scope.showStats = scope.type == 'Ranking' && scope.text != 'Food Near Me';

            var S = JSON.parse(scope.stats);
            scope.views = S.views;
            scope.answers = S.answers;
            scope.comments = S.numcom;

            if ($rootScope.DISPLAY_XSMALL == true) scope.sm = true;
            else scope.sm = false;

           if (scope.dir == "horizontal"){
               scope.dirHor = true;
               scope.dirVer = false;
           }
           if (scope.dir == "vertical"){
               scope.dirHor = false;
               scope.dirVer = true;
           }
           if (scope.bc2 == undefined) scope.bc2 = color.shadeColor(scope.bc,scope.shade/10);
            
        });   
           scope.$on('$destroy',function(){
                scope.isDestroyed = true;
            });
        
        scope.addView = function(){
            scope.views++;
        }
        
        },
    }
}
]);