(function () {
    'use strict';

    angular
        .module('login')
        .controller('bizlogin', bizlogin);

    bizlogin.$inject = ['$location', '$window', '$rootScope', 'login', 'dialog', 'userDetail','$state'];

    function bizlogin($location, $window, $rootScope, login, dialog, userDetail,$state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'bizlogin';

        // Members
        vm.username = '';
        vm.password = '';
        vm.code = '';
        vm.isProgressing = false;

        // Methods
        vm.submit = submit;

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

                vm.isProgressing = true;
                login.oauthWithFacebook(queryString)
                    .then(function (result) {

                        $rootScope.isLoggedIn = true;

                        console.log("isLoggedIn", $rootScope.isLoggedIn);

                        //$location.path('/');
                        $state.go('cwrapper', {}, {location: 'replace'});

                    },function () {
                        vm.isProgressing = false;
                    });
            }

            console.log("vm.code bizlogin --", vm.code);
            $rootScope.isLoggedIn = false;

        }

        function submit() {

            console.log("bizlogin - submit");
            login.initiate({
                email: vm.username,
                password: vm.password
            }).then(function () {
                $rootScope.isLoggedIn = true;

                console.log("isLoggedIn", $rootScope.isLoggedIn);
                $state.go('cwrapper', {}, {location: 'replace'});
            })
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


   }
})();
