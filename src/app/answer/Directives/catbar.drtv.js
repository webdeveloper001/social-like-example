angular.module('app').directive('catBar', ['color', '$window', '$rootScope','$state', 
function (color, $window, $rootScope, $state) {
    'use strict';

    return {
        templateUrl: 'app/answer/Partials/catbar.html',
        transclude: true,
        scope: {
            text: '@',
            leftFn: '&leftFn',
            rightFn: '&rightFn',
            closeRank: '&closeRank',
        },
        link: function (scope) {
            
            scope.bc = "#006dcc";
            scope.bc2 = color.shadeColor(scope.bc,-0.3);
            scope.fc = "white";
            if ($window.innerWidth < 769){
                scope.ht = 50;
                if (scope.text.length > 50) scope.ht = 90;            
            }
            else if ($window.innerWidth < 870){
                scope.ht = 50;
                if (scope.text.length > 50) scope.ht = 75;
            }
            else scope.ht = 50;

            scope.goPrev = function(){
                scope.leftFn();
            }

            scope.goNext = function(){
                scope.rightFn();
            }

            scope.selRank = function(){
                scope.closeRank();
            }           
        },
    }
}
]);