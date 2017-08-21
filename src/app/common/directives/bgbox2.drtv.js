angular.module('app').directive('bgBox2', ['color','$timeout',function (color,$timeout) {
    'use strict';

    return {
        templateUrl: 'app/common/partials/bgbox2.html',
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
            question: '@',
            isRankOfDay: '@',
        },
        link: function (scope, elem, attrs) {

        $timeout(function(){
            //console.log("@bgbox2 - scope.rank - ", scope.rank);
            var S = JSON.parse(scope.stats);
            scope.views = S.views;
            scope.answers = S.answers;
            scope.comments = S.numcom;
            
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
        },
    }
}
]);