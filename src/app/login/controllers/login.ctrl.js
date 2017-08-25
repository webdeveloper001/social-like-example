(function () {
    'use strict';

    angular
        .module('login')
        .controller('login', login);

    login.$inject = ['$location', '$window', '$rootScope', 'login', 'dialog', '$state', '$cookies','$http', '$facebook', 'fbusers', 'InstagramService'];

    function login($location, $window, $rootScope, login, dialog, $state, $cookies, $http, $facebook, fbusers, InstagramService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'login';

        // Members
        vm.username = '';
        vm.password = '';
        vm.code = '';
        vm.isProgressing = false;
        
        // Methods
        vm.submit = submit;
        vm.register = register;
        vm.redirectForFacebook = redirectForFacebook;
        vm.whyFacebookDialog = whyFacebookDialog;
        vm.facebookLogin = facebookLogin;
        vm.goBack = goBack;

        function facebookLogin(){
            login.facebookSDKLogin();
        }

        $rootScope.$on('redirectAfterLogin', function () {
            redirectToState();
        });

        // Only use on localhost to fake a FB login
        /*
        if (window.location.hostname == "localhost") {
          console.log("server is: " + window.location.hostname)
          console.log("let's fake your user as an FB login")
          login.setFakeLocalUser();
        }*/

        if ($rootScope.isLoggedIn) $state.go('cwrapper');
        // else activate();

        function activate() {

            //vm.response = parseResults();
            var queryString = location.search;


            var idx = queryString.lastIndexOf("?");

            if (idx >= 0) {
                queryString = queryString.substr(idx + 1);
            }

            if (queryString) {
                //vm.code = vm.response.code;
                
                vm.isProgressing = true;
                
                login.oauthWithFacebook(queryString)
                    .then(function (result) {

                        var currentUserLatitude = $cookies.get('currentUserLatitude');
                        var currentUserLongitude = $cookies.get('currentUserLongitude');

                        if (currentUserLatitude && currentUserLongitude) {
                            $rootScope.currentUserLatitude = currentUserLatitude;
                            $rootScope.currentUserLongitude = currentUserLongitude;
                            $rootScope.coordsRdy = true;
                            $rootScope.$emit('coordsRdy');
                        }

                        if ($rootScope.isLoggedIn) redirectToState();
    
                    }, function () {
                        vm.isProgressing = false;
                    });
            }

            console.log("vm.code", vm.code);
            $rootScope.isLoggedIn = false;
            $rootScope.isAdmin = false;
            $rootScope.dataAdmin = false;
            $rootScope.$emit('adminCredentials');

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

        function redirectToState(){
            
            var statename = $cookies.get('statename');
            var statenum = $cookies.get('statenum');

            if (statename == 'rankSummary' || statename == 'answerDetail') {
                $state.go(statename, { index: statenum });
            }
            else {
                $state.go('cwrapper');
            }
        }

        function redirectForFacebook() {

            login.loginWithFacebook()
                .then(function (result) {
                    console.log("result @loginWithFacebook - ", result);
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

        function goBack() {
            $state.go('cwrapper');
        }

        function whyFacebookDialog() {
            dialog.getDialog('whyFacebook');
        }
    }
})();
