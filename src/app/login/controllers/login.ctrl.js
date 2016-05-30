(function () {
    'use strict';

    angular
        .module('login')
        .controller('login', login);

    login.$inject = ['$location', '$window', '$rootScope', 'login','dialog']; 

    function login($location, $window, $rootScope, login, dialog) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'login';

        // Members
        vm.username = '';
        vm.password = '';
        vm.code = '';

        // Methods
        vm.submit = submit;
        vm.register = register;
        vm.redirectForFacebook = redirectForFacebook;
        vm.whyFacebookDialog = whyFacebookDialog;

        activate();

        function activate() {

            //vm.response = parseResults();
            var queryString = location.search;


            var idx = queryString.lastIndexOf("?");

            if (idx >= 0) {
                queryString = queryString.substr(idx + 1);
            }
            
            if (queryString) {
                //vm.code = vm.response.code;

                login.oauthWithFacebook(queryString)
                    .then(function (result) {

                        $rootScope.isLoggedIn = true;

                        console.log("isLoggedIn", $rootScope.isLoggedIn);
                        $location.path('/');
                    });
            }
            
            console.log("vm.code", vm.code)
            $rootScope.isLoggedIn = false;
            
        }

        function submit() {

            console.log("submit");
            login.initiate({
                email: vm.username,
                password: vm.password
            }).then(function () {
                $rootScope.isLoggedIn = true;

                console.log("isLoggedIn", $rootScope.isLoggedIn);
                $location.path('/');
            })
        }

        function redirectForFacebook() {

            login.loginWithFacebook()
                .then(function (result) {

                    $window.location = result.url;
                });
        }

        function parseResults() {

            var queryString = location.search;

            console.log("queryString", queryString);
            var idx = queryString.lastIndexOf("?");

            if (idx >= 0) {
                queryString = queryString.substr(idx + 1);
            }

            var params = {},
                regex = /([^&=]+)=([^&]*)/g,
                m;

            var counter = 0;

            while (m = regex.exec(queryString)) {
                params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
                if (counter++ > 50) {

                    return {
                        error: "Response exceedded expected number of parameters"
                    }
                }
            }

            for (var proper in params) {
                return params;
            }
        }

        function register() {

            $location.path('/register');
        }
        
        function whyFacebookDialog(){
            dialog.getDialog('whyFacebook');
        }
    }
})();
