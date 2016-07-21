angular.module('app').directive("userDetailModal",
    ["$rootScope", "userDetail", function ($rootScope, userDetail) {
        return {
            restrict: "E",
            templateUrl: "app/login/partials/add-user-detail.html",
            link: function ($scope, element, attrs, ngModel) {

                $scope.maxDate = moment().format('YYYY-MM-DD');

                $rootScope.openUserDetailModal = function(){

                    if($rootScope.user)
                    {
                        //select default options for gender as male
                        $rootScope.user.gender = "Male";
                        $rootScope.user.birth_date = '';
                    }
                    openModal("#addUserDetailModal");

                };


                /**
                 * Function to call service for adding user detail
                 * on success change local storage object for current user
                 */
                $rootScope.addUserDetail = function () {

                    userDetail.addUserDetail().then(function (result) {

                        userDetail.getUserDetail().then(function (result) {

                            if (Object.keys(result).length == 0) {

                                $rootScope.openUserDetailModal();

                            } else {
                                $rootScope.user.birth_date = result[0].birth_date;
                                $rootScope.user.age = calculateAge(new Date(result[0].birth_date));
                                $rootScope.user.gender = result.gender;

                                try {
                                    window.localStorage.user = JSON.stringify($rootScope.user);
                                } catch (e) { }
                            }

                        });
                        closeModal("#addUserDetailModal");
                    });
                };

            }
        }
    }]);