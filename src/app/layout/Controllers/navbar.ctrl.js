(function () {
    'use strict';

    angular
        .module('app')
        .controller('navbar', navbar);

    navbar.$inject = ['$location', '$translate', '$rootScope', 'login', '$state']; 

    function navbar($location, $translate, $rootScope, login, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'navbar';
        
        // Members
        vm.user = $rootScope.user;
        vm.isLoggedIn = $rootScope.isLoggedIn ? $rootScope.isLoggedIn : false;

        // Methods
        vm.logout = logout;
        vm.goToLogin = goToLogin;
        vm.gotoAbout = gotoAbout;
        vm.gotoAdmin = gotoAdmin;

        activate();

        function activate() {
            
            console.log("Navbar Loaded!");
            //console.log("isLoggedIn", !$rootScope.isLoggedIn)
            //console.log("user", $rootScope.user);
        }

        function gotoAbout() {
            //$stateProvider.state('app');
            $state.go('about');
        }
        
        function gotoAdmin() {
            //$stateProvider.state('app');
            $state.go('admin');
        }
        
        function goToLogin() {

            $location.path('/login');
        }

        function logout() {

            login.logout().then(function () {

                vm.user = '';
                vm.isLoggedIn = false;
                $location.path('/');
            });
        }
    }
})();
