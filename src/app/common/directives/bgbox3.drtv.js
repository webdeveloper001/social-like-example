angular.module('app').directive('bgBox3', ['color','$timeout',function (color,$timeout) {
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
            question: '@',
            imageurl: '@',
            type: '@',
            isRankOfDay: '@'
        },
        link: function (scope) {

        $timeout(function(){

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