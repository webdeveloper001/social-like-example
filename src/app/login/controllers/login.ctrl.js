(function () {
    'use strict';

    angular
        .module('login')
        .controller('login', login);

    login.$inject = ['$location', '$window', '$rootScope', 'login', 'dialog', '$state', '$cookies','$http', '$facebook'];

    function login($location, $window, $rootScope, login, dialog, $state, $cookies, $http, $facebook) {
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
            login.loginWithFacebook()
            .then(function(res){
                return $facebook.login('public_profile,email,user_friends')
                .then(function(res){
                    if(res.status === 'connected'){
                        console.log(res);
                        return $facebook.api("/me?fields=id,name,picture,first_name,last_name,gender,age_range");
                    }
                })
                .then(function(me){
                    console.log('My info: ', me);

                    // $http.defaults.headers.common['X-DreamFactory-Session-Token'] = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjI5LCJ1c2VyX2lkIjoyOSwiZW1haWwiOiIxMDE1NDY3NDU1MTgyMjI3MCtmYWNlYm9va0BmYWNlYm9vay5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2FwaS5yYW5rLXguY29tXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNDgxNjYzMDg3LCJleHAiOjE0ODE2NjY2ODcsIm5iZiI6MTQ4MTY2MzA4NywianRpIjoiYWQ2M2Q0OTI1MDRmNTJiYjBkMWZiZjJkNzAxMjQzNDMifQ.T-3B-jnz4d2Q2Q5rfN1ePF7ujin982gzPYbRwhLo9Uc";

                    // $cookies.session_token = result.data.session_token;

                    $rootScope.user = me;
                    $rootScope.isLoggedIn = true;

                    try {
                        window.localStorage.user = JSON.stringify(me);
                        //$window.location.search = '';
                    } catch (e) { }

                    if ($rootScope.DEBUG_MODE) console.log("oauthWithFacebook succesful");
                    // $rootScope.$emit('redirectAfterLogin');
                    return $facebook.api('me/friends?fields=first_name,gender,location,last_name');
                })
                .then(function(friends){
                    console.log('Got friends: ', friends);
                    redirectToState();
                })
                .catch(function(err){
                    console.log(err);   
                });
            });
            
        }

        $rootScope.$on('redirectAfterLogin', function () {
            redirectToState();
        });

        //Only use on localhost to fake a FB login
        // if (window.location.hostname == "localhost") {
        //   console.log("server is: " + window.location.hostname)
        //   console.log("let's fake your user as an FB login")
        //   login.setFakeLocalUser();
        // }

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
