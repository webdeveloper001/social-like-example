angular.module('app').directive("citySelectionModal",
        ["$rootScope", function ($rootScope) {
                'use strict';
            return {
                restrict: "E",
                templateUrl: "app/layout/Partials/city-selection.html",
                link: function ($scope, element, attrs, ngModel) {

                    $rootScope.selectedCity = JSON.parse(window.localStorage.selectedCity);

                }
            }
        }]);