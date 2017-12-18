angular.module('app').directive('bgBox', ['color',function (color) {
    'use strict';

    return {
        templateUrl: 'app/common/partials/bgbox.html',
        transclude: true,
        scope: {
            bc: '@',
            bc2: '@',
            fc: '@',
            shade: '@',
            text: '@',
            dir: '@',
            w: '@',
            h: '@',
        },
        link: function (scope) {
            
            scope.isNext = false;
            scope.isPrev = false;
            if (scope.text == '<') scope.isPrev = true;
            if (scope.text == '>') scope.isNext = true;

           if (scope.dir == "horizontal"){
               scope.dirHor = true;
               scope.dirVer = false;
           }
           if (scope.dir == "vertical"){
               scope.dirHor = false;
               scope.dirVer = true;
           }
           if (scope.bc2 == undefined) scope.bc2 = color.shadeColor(scope.bc,scope.shade/10); 
        },
    }
}
]);