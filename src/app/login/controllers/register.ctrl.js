(function () {
    'use strict';

    angular
        .module('login')
        .controller('register', register);

    register.$inject = ['$location', '$rootScope', 'login']; 

    function register($location, $rootScope, login) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'register';

        // Members
        vm.username = '';
        vm.password = '';
        vm.confirm = '';
        vm.firstName = '';
        vm.lastName = '';
        vm.message = '';

        // Methods
        vm.register = register;
        vm.signIn = signIn;

        activate();

        function activate() {

            $rootScope.isLoggedIn = false;
        }

        function register() {

            console.log("register", register);
            login.register({
                email: vm.username,
                password: vm.password,
                first_name: vm.firstName || 'Address',
                last_name: vm.lastName || 'Book'
            }).then(function () {
                $location.path('/bizlogin');
            }, function (error) {

                vm.message = error.Message;
                console.log("Error: ", error);
            });
        }

        function signIn() {

            $location.path('/bizlogin');
        }
    }
})();
