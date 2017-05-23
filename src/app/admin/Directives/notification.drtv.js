angular.module('app').directive('notificationBlock', 
    ['$rootScope', '$state', 'answer', 'table', 'catans', '$timeout', 'vrows','$window','cblock','color','search',
    function ($rootScope, $state, answer, table, catans, $timeout, vrows, $window, cblock, color, search) {
    'use strict';

    return {
        templateUrl: 'app/admin/Partials/notification.drtv.html',
        transclude: true,
        scope: {
            notifications: '='
        },
        controller: ['$scope',
            
            function contentCtrl($scope) {
                var vm = $scope;
                
 
            }], //end controller
        link: function (scope) {
            console.log(scope.notifications);
        },
    }
}

]);