angular.module('app').directive("userDetailModal",
    ["$rootScope", "userDetail", function ($rootScope, userDetail) {
        return {
            restrict: "E",
            templateUrl: "app/login/partials/add-user-detail.html",
            link: function ($scope, element, attrs, ngModel) {

                /**
                 * Function to call service for adding user detail
                 * on success change local storage object for current user
                 */
                $rootScope.addUserDetail = function () {
                    userDetail.addUserDetail().then(function (result) {
                        $rootScope.user.age = result.age;
                        $rootScope.user.location = result.location;
                        $rootScope.user.gender = result.gender;
                        closeModal("#addUserDetailModal");
                        try {
                            window.localStorage.user = JSON.stringify($rootScope.user);
                        } catch (e) { }
                    });
                };

            }
        }
    }]);