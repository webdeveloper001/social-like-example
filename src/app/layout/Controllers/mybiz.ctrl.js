(function () {
    'use strict';

    angular
        .module('app')
        .controller('mybiz', mybiz);

    mybiz.$inject = ['$location', '$state','$window', 'useraccnt'];

    // console.log("User is: " + $rootScope.user);

    console.write

    function mybiz(location, $state, $window, useraccnt) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'mybiz';


        // Members
        // vm.username = '';
        // vm.password = '';

        // Methods
        // vm.submit = submit;
        vm.goBack = goBack;
        vm.setupFreeBillingAccount = setupFreeBillingAccount;

        activate();

        function activate() {
            console.log("mybiz page Loaded!");
        }

        function setupFreeBillingAccount() {
          console.log("mybiz.ctrl.js calling useraccnt.setupFreeBillingAccount()");
          // useraccnt.setupFreeBillingAccount();
        }

        function goBack() {
            $state.go('cwrapper');
        }

    }
})();
