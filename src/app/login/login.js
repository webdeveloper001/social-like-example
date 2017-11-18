(function () {
    'use strict';

    angular.module('login', [
        // Angular modules 
        //'ngResource',
        'ngCookies',

        // Custom modules 

        // 3rd Party Modules
        'ui.router'
    ])

    .run(['$rootScope', function ($rootScope) {

        try {
            $rootScope.user = JSON.parse(window.localStorage.user);

            if ($rootScope.user) {
                $rootScope.isLoggedIn = true;
            }
            if ($rootScope.user.is_sys_admin){
                $rootScope.isAdmin = true;
            }
        } catch (e) { };
    }])

    .config(function() {

        // Set your appId through the setAppId method or
        // use the shortcut in the initialize method directly
        //FacebookProvider.init('582752768556573');
    })
})();
